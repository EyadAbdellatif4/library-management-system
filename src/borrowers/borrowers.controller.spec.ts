import { Test, TestingModule } from '@nestjs/testing';
import { BorrowersController } from './borrowers.controller';
import { BorrowersService } from './borrowers.service';

describe('BorrowersController', () => {
  let controller: BorrowersController;
  let service: BorrowersService;

  const mockBorrower = {
    id: '1',
    name: 'Test Borrower',
    email: 'test@example.com',
  };

  const mockBorrowersService = {
    create: jest.fn().mockResolvedValue(mockBorrower),
    findAll: jest.fn().mockResolvedValue({ data: [mockBorrower], pagination: {} }),
    findById: jest.fn().mockResolvedValue(mockBorrower),
    update: jest.fn().mockResolvedValue(mockBorrower),
    remove: jest.fn().mockResolvedValue({ message: 'Deleted' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BorrowersController],
      providers: [
        {
          provide: BorrowersService,
          useValue: mockBorrowersService,
        },
      ],
    }).compile();

    controller = module.get<BorrowersController>(BorrowersController);
    service = module.get<BorrowersService>(BorrowersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a borrower', async () => {
      const dto = { name: 'B', email: 'E@E.com' };
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

  describe('findById', () => {
    it('should call findById', async () => {
      await controller.findOne('1');
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should call update', async () => {
      const dto = { name: 'Updated' };
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
