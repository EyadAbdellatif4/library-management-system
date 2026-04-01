import { Test, TestingModule } from '@nestjs/testing';
import { BorrowersService } from './borrowers.service';
import { getModelToken } from '@nestjs/sequelize';
import { Borrower } from './entities/borrower.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BorrowersService', () => {
  let service: BorrowersService;
  let model: typeof Borrower;

  const mockBorrower = {
    id: '1',
    name: 'Test Borrower',
    email: 'test@example.com',
    update: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockReturnValue({ id: '1', name: 'Test Borrower' }),
  };

  const mockBorrowerModel = {
    create: jest.fn().mockResolvedValue(mockBorrower),
    findOne: jest.fn().mockResolvedValue(null),
    findAndCountAll: jest.fn().mockResolvedValue({ count: 1, rows: [mockBorrower] }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BorrowersService,
        {
          provide: getModelToken(Borrower),
          useValue: mockBorrowerModel,
        },
      ],
    }).compile();

    service = module.get<BorrowersService>(BorrowersService);
    model = module.get<typeof Borrower>(getModelToken(Borrower));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a borrower', async () => {
      const createDto = { 
        name: 'New Borrower', 
        email: 'new@example.com'
      };
      
      const result = await service.create(createDto);
      
      expect(model.findOne).toHaveBeenCalled();
      expect(model.create).toHaveBeenCalled();
      expect(result).toEqual(mockBorrower);
    });

    it('should throw BadRequestException if email exists', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockBorrower as any);
      const createDto = { 
        name: 'New Borrower', 
        email: 'test@example.com'
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated borrowers', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      
      expect(model.findAndCountAll).toHaveBeenCalled();
      expect(result.data).toEqual([mockBorrower]);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a borrower if found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockBorrower as any);
      
      const result = await service.findById('1');
      
      expect(result).toEqual(mockBorrower);
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);
      
      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a borrower successfully', async () => {
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockBorrower as any);
      
      const result = await service.update('1', { name: 'Updated Name' });
      
      expect(mockBorrower.update).toHaveBeenCalledWith({ name: 'Updated Name' });
      expect(result).toEqual(mockBorrower);
    });
  });

  describe('remove', () => {
    it('should soft delete a borrower', async () => {
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockBorrower as any);
      
      const result = await service.remove('1');
      
      expect(mockBorrower.save).toHaveBeenCalled();
      expect(result.message).toBe('Borrower deleted successfully');
    });
  });
});
