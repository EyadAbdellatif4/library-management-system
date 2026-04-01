import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getModelToken } from '@nestjs/sequelize';
import { Book } from './entities/book.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BooksService', () => {
  let service: BooksService;
  let model: typeof Book;

  const mockBook = {
    id: '1',
    title: 'Test Book',
    author: 'Test Author',
    isbn: '1234567890',
    available_quantity: 5,
    borrowed_quantity: 0,
    update: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockReturnValue({ id: '1', title: 'Test Book' }),
  };

  const mockBookModel = {
    create: jest.fn().mockResolvedValue(mockBook),
    findOne: jest.fn().mockResolvedValue(null),
    findAndCountAll: jest.fn().mockResolvedValue({ count: 1, rows: [mockBook] }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getModelToken(Book),
          useValue: mockBookModel,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    model = module.get<typeof Book>(getModelToken(Book));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a book', async () => {
      const createDto = { 
        title: 'New Book', 
        author: 'Author', 
        isbn: '123', 
        available_quantity: 10,
        shelf_location: 'A1',
        description: 'Desc'
      };
      
      const result = await service.create(createDto);
      
      expect(model.findOne).toHaveBeenCalled();
      expect(model.create).toHaveBeenCalled();
      expect(result).toEqual(mockBook);
    });

    it('should throw BadRequestException if ISBN exists', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockBook as any);
      const createDto = { 
        title: 'New Book', 
        author: 'Author', 
        isbn: '123', 
        available_quantity: 10,
        shelf_location: 'A1',
        description: 'Desc'
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      
      expect(model.findAndCountAll).toHaveBeenCalled();
      expect(result.data).toEqual([mockBook]);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a book if found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockBook as any);
      
      const result = await service.findById('1');
      
      expect(result).toEqual(mockBook);
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);
      
      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a book successfully', async () => {
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockBook as any);
      
      const result = await service.update('1', { title: 'Updated Title' });
      
      expect(mockBook.update).toHaveBeenCalledWith({ title: 'Updated Title' });
      expect(result).toEqual(mockBook);
    });
  });

  describe('remove', () => {
    it('should soft delete a book', async () => {
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockBook as any);
      
      const result = await service.remove('1');
      
      expect(mockBook.save).toHaveBeenCalled();
      expect(result.message).toBe('Book deleted successfully');
    });
  });
});
