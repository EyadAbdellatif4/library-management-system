import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

  const mockBook = {
    id: '1',
    title: 'Test Book',
    author: 'Test Author',
    isbn: '12',
    available_quantity: 5,
    borrowed_quantity: 0,
  };

  const mockBooksService = {
    create: jest.fn().mockResolvedValue(mockBook),
    findAll: jest.fn().mockResolvedValue({ data: [mockBook], pagination: {} }),
    findById: jest.fn().mockResolvedValue(mockBook),
    update: jest.fn().mockResolvedValue(mockBook),
    remove: jest.fn().mockResolvedValue({ message: 'Deleted' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a book', async () => {
      const dto = { title: 'T', author: 'A', isbn: 'ISBN', available_quantity: 1, shelf_location: 'A1', description: 'desc' };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call findAll with filters', async () => {
      const filters = { page: 1, limit: 10 };
      await controller.findAll(filters);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne', () => {
    it('should call findById', async () => {
      await controller.findOne('1');
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should call update', async () => {
      const dto = { title: 'Updated' };
      await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should call remove', async () => {
      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
