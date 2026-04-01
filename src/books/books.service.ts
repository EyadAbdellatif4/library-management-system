import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BooksFilterDto } from './dto/books-filter.dto';
import { IBook } from './interfaces/book.interface';
import { Op } from 'sequelize';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book)
    private bookModel: typeof Book,
  ) { }

  /**
   * Create a new book
   */
  async create(createBookDto: CreateBookDto): Promise<IBook> {

    const existingBook = await this.bookModel.findOne({
      where: { isbn: createBookDto.isbn },
    });

    if (existingBook) {
      throw new BadRequestException('A book with this ISBN already exists');
    }

    const book = await this.bookModel.create({
      ...createBookDto,
    } as Book);

    return book as IBook;
  }

  /**
   * Find all books with optional filtering, searching, pagination, and sorting
   */
  async findAll(filterDto: BooksFilterDto) {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;
    const sortBy = filterDto.sortBy || 'createdAt';
    const sortOrder = filterDto.sortOrder || 'DESC';

    // Build where clause
    const whereConditions: any[] = [{ deletedAt: null }];

    // Add search across multiple fields
    if (filterDto.search) {
      whereConditions.push({
        [Op.or]: [
          { title: { [Op.iLike]: `%${filterDto.search}%` } },
          { author: { [Op.iLike]: `%${filterDto.search}%` } },
          { isbn: { [Op.iLike]: `%${filterDto.search}%` } },
          { description: { [Op.iLike]: `%${filterDto.search}%` } },
        ],
      });
    }

    // Add specific field filters
    if (filterDto.title) {
      whereConditions.push({ title: { [Op.iLike]: `%${filterDto.title}%` } });
    }
    if (filterDto.author) {
      whereConditions.push({ author: { [Op.iLike]: `%${filterDto.author}%` } });
    }
    if (filterDto.isbn) {
      whereConditions.push({ isbn: filterDto.isbn });
    }

    const { count, rows } = await this.bookModel.findAndCountAll({
      where: { [Op.and]: whereConditions } as any,
      offset,
      limit,
      order: [[sortBy, sortOrder]],
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
   * Find a book by ID
   */
  async findById(id: string): Promise<Book> {
    const book = await this.bookModel.findOne({
      where: {
        id,
        deletedAt: null,
      } as any,
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found or deleted`);
    }

    return book;
  }



  /**
   * Update a book
   */
  async update(id: string, updateBookDto: UpdateBookDto) {
    const book = await this.findById(id);

    // Check if ISBN is being updated to an existing ISBN
    if (updateBookDto.isbn && updateBookDto.isbn !== book.isbn) {
      const existingBook = await this.bookModel.findOne({
        where: { isbn: updateBookDto.isbn },
      });

      if (existingBook) {
        throw new BadRequestException('A book with this ISBN already exists');
      }
    }

    await book.update(updateBookDto);
    return book;
  }

  /**
   * Delete a book (soft delete)
   */
  async remove(id: string) {
    const book = await this.findById(id);
    book.deletedAt = new Date();
    await book.save();
    return { message: 'Book deleted successfully' };
  }

  /**
   * Update available quantity (internal use)
   */
  async updateAvailableQuantity(bookId: string, quantity: number, transaction?: any) {
    const book = await this.findById(bookId);

    book.available_quantity += quantity;
    book.borrowed_quantity -= quantity;

    await book.save({ transaction });
    return book;
  }

  /**
   * Update borrowed quantity (internal use)
   */
  async updateBorrowedQuantity(bookId: string, quantity: number, transaction?: any) {
    const book = await this.findById(bookId);

    book.available_quantity -= quantity;
    book.borrowed_quantity += quantity;

    await book.save({ transaction });
    return book;
  }
}
