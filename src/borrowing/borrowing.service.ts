import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { BorrowingTransaction } from './entities/borrowing-transaction.entity';
import { BooksService } from '../books/books.service';
import { BorrowersService } from '../borrowers/borrowers.service';
import { CheckoutBookDto } from './dto/checkout-book.dto';
import { ReturnBookDto } from './dto/return-book.dto';
import { BorrowingFilterDto } from './dto/borrowing-filter.dto';
import { IBorrowingTransaction } from './interfaces/borrowing-transaction.interface';
import { Op, WhereOptions } from 'sequelize';

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

    if (book.deletedAt) {
      throw new NotFoundException('Book not found or deleted');
    }

    if (book.available_quantity <= 0) {
      throw new BadRequestException('This book is not available for checkout');
    }

    const borrower = await this.borrowersService.findById(
      checkoutBookDto.borrower_id,
    );

    if (borrower.deletedAt) {
      throw new NotFoundException('Borrower not found or deleted');
    }



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
          'Borrowing transaction not found or already returned',
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
          status: 'BORROWED',
          due_date: {
            [Op.lt]: now,
          },
          deletedAt: null,
        } as any,
        include: ['book', 'borrower'],
        offset,
        limit,
        order: [['due_date', 'ASC']],
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
      throw new NotFoundException('Borrowing transaction not found');
    }

    return transaction as IBorrowingTransaction;
  }
}
