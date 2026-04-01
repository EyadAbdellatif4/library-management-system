import { Test, TestingModule } from '@nestjs/testing';
import { BorrowingService } from './borrowing.service';
import { getModelToken } from '@nestjs/sequelize';
import { BorrowingTransaction } from './entities/borrowing-transaction.entity';
import { BooksService } from '../books/books.service';
import { BorrowersService } from '../borrowers/borrowers.service';
import { Sequelize } from 'sequelize-typescript';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BorrowingService', () => {
  let service: BorrowingService;
  let model: typeof BorrowingTransaction;
  let booksService: BooksService;
  let borrowersService: BorrowersService;
  let sequelize: Sequelize;

  const mockTransaction = {
    id: '1',
    book_id: 'book1',
    borrower_id: 'bor1',
    status: 'BORROWED',
    checkout_date: new Date(),
    due_date: new Date(),
    save: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockReturnValue({ id: '1', status: 'BORROWED' }),
  };

  const mockModel = {
    create: jest.fn().mockResolvedValue(mockTransaction),
    findOne: jest.fn().mockResolvedValue(mockTransaction),
    findAll: jest.fn().mockResolvedValue([mockTransaction]),
    findAndCountAll: jest.fn().mockResolvedValue({ count: 1, rows: [mockTransaction] }),
    count: jest.fn().mockResolvedValue(1),
  };

  const mockBooksService = {
    findById: jest.fn().mockResolvedValue({ id: 'book1', available_quantity: 5, title: 'Title' }),
    updateBorrowedQuantity: jest.fn().mockResolvedValue(true),
    updateAvailableQuantity: jest.fn().mockResolvedValue(true),
  };

  const mockBorrowersService = {
    findById: jest.fn().mockResolvedValue({ id: 'bor1', name: 'Name' }),
  };

  const mockSequelize = {
    transaction: jest.fn(async (cb) => await cb({})),
    fn: jest.fn(),
    col: jest.fn(),
    literal: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BorrowingService,
        { provide: getModelToken(BorrowingTransaction), useValue: mockModel },
        { provide: BooksService, useValue: mockBooksService },
        { provide: BorrowersService, useValue: mockBorrowersService },
        { provide: Sequelize, useValue: mockSequelize },
      ],
    }).compile();

    service = module.get<BorrowingService>(BorrowingService);
    model = module.get<typeof BorrowingTransaction>(getModelToken(BorrowingTransaction));
    booksService = module.get<BooksService>(BooksService);
    borrowersService = module.get<BorrowersService>(BorrowersService);
    sequelize = module.get<Sequelize>(Sequelize);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkoutBook', () => {
    it('should successfully checkout a book', async () => {
      const dto = { book_id: 'book1', borrower_id: 'bor1' };
      
      const result = await service.checkoutBook(dto);
      
      expect(booksService.findById).toHaveBeenCalledWith('book1');
      expect(borrowersService.findById).toHaveBeenCalledWith('bor1');
      expect(sequelize.transaction).toHaveBeenCalled();
      expect(model.create).toHaveBeenCalled();
      expect(booksService.updateBorrowedQuantity).toHaveBeenCalled();
    });

    it('should throw BadRequestException if book is unavailable', async () => {
      jest.spyOn(booksService, 'findById').mockResolvedValueOnce({ id: 'b', available_quantity: 0, title: 'T' } as any);
      
      await expect(service.checkoutBook({ book_id: 'b', borrower_id: 'bor1' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('returnBook', () => {
    it('should successfully return a book', async () => {
      const result = await service.returnBook({ transaction_id: '1' });
      
      expect(model.findOne).toHaveBeenCalled();
      expect(mockTransaction.save).toHaveBeenCalled();
      expect(booksService.updateAvailableQuantity).toHaveBeenCalled();
    });

    it('should throw NotFoundException if transaction not found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);
      
      await expect(service.returnBook({ transaction_id: '999' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics data', async () => {
      const result = await service.getAnalytics({ startDate: '2025-01-01', endDate: '2025-01-31' });
      
      expect(model.count).toHaveBeenCalled();
      expect(model.findAll).toHaveBeenCalledTimes(2); // statusCounts and topBooks
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('topBooks');
    });
  });
});
