import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { BorrowingTransaction } from './entities/borrowing-transaction.entity';
import { BooksService } from '../books/books.service';
import { Book } from '../books/entities/book.entity';
import { Borrower } from '../borrowers/entities/borrower.entity';
import { BorrowersService } from '../borrowers/borrowers.service';
import { CheckoutBookDto } from './dto/checkout-book.dto';
import { ReturnBookDto } from './dto/return-book.dto';
import { BorrowingFilterDto } from './dto/borrowing-filter.dto';
import { IBorrowingTransaction } from './interfaces/borrowing-transaction.interface';
import { Op, WhereOptions, Sequelize as Sql } from 'sequelize';
import { Parser as CsvParser } from 'json2csv';
import * as ExcelJS from 'exceljs';
import { AnalyticsFilterDto, ExportFilterDto } from './dto/report-filter.dto';

@Injectable()
export class BorrowingService {
  constructor(
    @InjectModel(BorrowingTransaction)
    private borrowingTransactionModel: typeof BorrowingTransaction,
    private booksService: BooksService,
    private borrowersService: BorrowersService,
    private sequelize: Sequelize,
  ) { }

  /**
   * Checkout a book for a borrower
   */
  async checkoutBook(checkoutBookDto: CheckoutBookDto) {
    const book = await this.booksService.findById(checkoutBookDto.book_id);

    if (book.available_quantity <= 0) {
      throw new BadRequestException(
        `Book "${book.title}" (ID: ${book.id}) is out of stock and not available for checkout`,
      );
    }

    const borrower = await this.borrowersService.findById(
      checkoutBookDto.borrower_id,
    );



    // Use single transaction for the entire checkout process
    return await this.sequelize.transaction(async (t) => {

      const checkoutDate = new Date();
      const dueDate = new Date(
        checkoutDate.getTime() + 30 * 24 * 60 * 60 * 1000, // 30 days
      );

      const transaction = await this.borrowingTransactionModel.create(
        {
          book_id: checkoutBookDto.book_id,
          borrower_id: checkoutBookDto.borrower_id,
          checkout_date: checkoutDate,
          due_date: dueDate,
          status: 'BORROWED',
        } as any,
        { transaction: t },
      );

      await this.booksService.updateBorrowedQuantity(
        checkoutBookDto.book_id,
        1,
        t,
      );

      // Reload transaction with associations (outside internal transaction scope but still returning it)
      return await this.borrowingTransactionModel.findOne({
        where: { id: transaction.id },
        include: ['book', 'borrower'],
        transaction: t,
      });
    });
  }

  /**
   * Return a book
   */
  async returnBook(returnBookDto: ReturnBookDto) {
    return await this.sequelize.transaction(async (t) => {
      const transaction = await this.borrowingTransactionModel.findOne({
        where: {
          id: returnBookDto.transaction_id,
          status: 'BORROWED',
        },
        transaction: t,
      });

      if (!transaction) {
        throw new NotFoundException(
          `Active borrowing transaction with ID ${returnBookDto.transaction_id} not found or already returned`,
        );
      }

      // Update transaction status
      transaction.return_date = new Date();
      transaction.status = 'RETURNED';
      await transaction.save({ transaction: t });

      // Update book quantity within transaction
      await this.booksService.updateAvailableQuantity(
        transaction.book_id,
        1,
        t,
      );

      // Reload transaction with associations
      return await this.borrowingTransactionModel.findOne({
        where: { id: transaction.id },
        include: ['book', 'borrower'],
        transaction: t,
      });
    });
  }

  /**
   * Find all borrowing transactions with optional filtering, searching, pagination, and sorting
   */
  async findAll(filterDto: BorrowingFilterDto) {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;
    const sortBy = filterDto.sortBy || 'createdAt';
    const sortOrder = filterDto.sortOrder || 'DESC';

    // Build where clause
    const whereConditions: WhereOptions[] = [{ deletedAt: null as any }];

    // Add search across multiple fields
    if (filterDto.search) {
      whereConditions.push({
        [Op.or]: [
          { '$book.title$': { [Op.iLike]: `%${filterDto.search}%` } },
          { '$borrower.name$': { [Op.iLike]: `%${filterDto.search}%` } },
        ],
      } as any);
    }

    // Add specific field filters
    if (filterDto.borrowerId) {
      whereConditions.push({ borrower_id: filterDto.borrowerId } as any);
    }
    if (filterDto.bookId) {
      whereConditions.push({ book_id: filterDto.bookId } as any);
    }
    if (filterDto.status) {
      whereConditions.push({ status: filterDto.status } as any);
    }

    const { count, rows } =
      await this.borrowingTransactionModel.findAndCountAll({
        where: { [Op.and]: whereConditions },
        include: ['book', 'borrower'],
        offset,
        limit,
        order: [[sortBy, sortOrder]],
        distinct: true,
      });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get borrowing transactions by borrower
   */
  async getBorrowerBooks(
    borrowerId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    // Validate borrower exists
    await this.borrowersService.findById(borrowerId);
    const offset = (page - 1) * limit;

    const { count, rows } =
      await this.borrowingTransactionModel.findAndCountAll({
        where: {
          borrower_id: borrowerId,
          status: 'BORROWED',
          deletedAt: null,
        } as any,
        include: ['book'],
        offset,
        limit,
        order: [['checkout_date', 'DESC']],
      });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get overdue books
   */
  async getOverdueBooks(page: number = 1, limit: number = 10) {
    const now = new Date();
    const offset = (page - 1) * limit;

    const { count, rows } =
      await this.borrowingTransactionModel.findAndCountAll({
        where: {
          status: { [Op.in]: ['BORROWED', 'OVERDUE'] },
          checkout_date: { [Op.gt]: Sql.col('due_date') },
          deletedAt: null,
        } as any,
        include: ['book', 'borrower'],
        offset,
        limit,
        order: [['due_date', 'ASC']],
      });

    const mappedData = rows.map((transaction) => {
      const data = transaction.get({ plain: true });
      const checkoutDate = new Date(data.checkout_date);
      const dueDate = new Date(data.due_date);
      const overdueMs = checkoutDate.getTime() - dueDate.getTime();
      const overdue_days = Math.max(0, Math.ceil(overdueMs / (1000 * 60 * 60 * 24)));

      return {
        ...data,
        overdue_days,
      };
    });

    return {
      data: mappedData,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get borrowing history for a borrower
   */
  async getBorrowerHistory(
    borrowerId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    // Validate borrower exists
    await this.borrowersService.findById(borrowerId);
    const offset = (page - 1) * limit;

    const { count, rows } =
      await this.borrowingTransactionModel.findAndCountAll({
        where: {
          borrower_id: borrowerId,
          deletedAt: null,
        } as any,
        include: ['book'],
        offset,
        limit,
        order: [['checkout_date', 'DESC']],
      });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get transaction details
   */
  async findById(id: string): Promise<IBorrowingTransaction> {
    const transaction = await this.borrowingTransactionModel.findOne({
      where: {
        id,
        deletedAt: null,
      } as any,
      include: ['book', 'borrower'],
    });

    if (!transaction) {
      throw new NotFoundException(`Borrowing transaction with ID ${id} not found`);
    }

    return transaction as IBorrowingTransaction;
  }

  /**
   * Get analytical reports of the borrowing process
   */
  async getAnalytics(filter: AnalyticsFilterDto) {
    const whereConditions: WhereOptions = { deletedAt: null };

    if (filter.startDate && filter.endDate) {
      whereConditions.checkout_date = {
        [Op.between]: [new Date(filter.startDate), new Date(filter.endDate)],
      };
    } else if (filter.startDate) {
      whereConditions.checkout_date = {
        [Op.gte]: new Date(filter.startDate),
      };
    } else if (filter.endDate) {
      whereConditions.checkout_date = {
        [Op.lte]: new Date(filter.endDate),
      };
    }

    if (filter.status) {
      whereConditions.status = filter.status;
    }

    // Basic totals
    const totalTransactions = await this.borrowingTransactionModel.count({
      where: whereConditions,
    });

    const statusCounts = await this.borrowingTransactionModel.findAll({
      attributes: [
        'status',
        [this.sequelize.fn('COUNT', this.sequelize.col('status')), 'count'],
      ],
      where: whereConditions,
      group: ['status'],
    });

    // Top 5 books checked out
    // Top 5 books checked out
    const topBooks = (await this.borrowingTransactionModel.findAll({
      attributes: [
        'book_id',
        [this.sequelize.fn('COUNT', this.sequelize.col('BorrowingTransaction.id')), 'count'],
      ],
      where: whereConditions,
      include: [
        {
          model: Book,
          attributes: ['title'],
        },
      ],
      group: ['BorrowingTransaction.book_id', 'book.id', 'book.title'],
      order: [[this.sequelize.literal('count'), 'DESC']],
      limit: 5,
      raw: true,
      nest: true,
    })) as any[];

    return {
      period: {
        startDate: filter.startDate || 'all time',
        endDate: filter.endDate || 'now',
      },
      summary: {
        totalTransactions,
        byStatus: statusCounts.map((s) => ({
          status: s.status,
          count: parseInt(s.get('count') as string),
        })),
      },
      topBooks: topBooks.map((b) => ({
        id: b.book_id,
        title: b.book ? b.book.title : null,
        count: parseInt(b.count),
      })),
    };
  }

  /**
   * Export borrowing data in CSV or XLSX format
   */
  async exportData(filter: ExportFilterDto) {
    const whereConditions: WhereOptions = { deletedAt: null };

    if (filter.startDate && filter.endDate) {
      whereConditions.checkout_date = {
        [Op.between]: [new Date(filter.startDate), new Date(filter.endDate)],
      };
    }

    if (filter.status) {
      whereConditions.status = filter.status;
    }

    const transactions = await this.borrowingTransactionModel.findAll({
      where: whereConditions,
      include: [
        { model: Book, as: 'book' },
        { model: Borrower, as: 'borrower' },
      ],
      order: [['checkout_date', 'DESC']],
    });

    const flattenedData = transactions.map((t) => {
      const data = t.get({ plain: true });
      return {
        transaction_id: data.id,
        book_title: data.book?.title,
        borrower_name: data.borrower?.name,
        checkout_date: data.checkout_date,
        due_date: data.due_date,
        return_date: data.return_date,
        status: data.status,
      };
    });

    let buffer: Buffer;
    let contentType: string;
    let fileExtension: string;

    if (filter.format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Borrowing Report');

      worksheet.columns = [
        { header: 'ID', key: 'transaction_id', width: 20 },
        { header: 'Book Title', key: 'book_title', width: 30 },
        { header: 'Borrower', key: 'borrower_name', width: 20 },
        { header: 'Checkout Date', key: 'checkout_date', width: 15 },
        { header: 'Due Date', key: 'due_date', width: 15 },
        { header: 'Return Date', key: 'return_date', width: 15 },
        { header: 'Status', key: 'status', width: 10 },
      ];

      worksheet.addRows(flattenedData);
      buffer = (await workbook.xlsx.writeBuffer()) as any;
      contentType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileExtension = 'xlsx';
    } else {
      // Default to CSV
      const fields = [
        'transaction_id',
        'book_title',
        'borrower_name',
        'checkout_date',
        'due_date',
        'return_date',
        'status',
      ];
      const parser = new CsvParser({ fields });
      const csv = parser.parse(flattenedData);
      buffer = Buffer.from(csv);
      contentType = 'text/csv';
      fileExtension = 'csv';
    }

    const filename = `borrowing_report_${new Date().toISOString().split('T')[0]}.${fileExtension}`;

    return {
      buffer,
      filename,
      contentType,
    };
  }
}
