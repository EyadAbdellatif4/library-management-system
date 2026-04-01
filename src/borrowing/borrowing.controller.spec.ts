import { Test, TestingModule } from '@nestjs/testing';
import { BorrowingController } from './borrowing.controller';
import { BorrowingService } from './borrowing.service';
import { ExportFormat } from './dto/report-filter.dto';

describe('BorrowingController', () => {
  let controller: BorrowingController;
  let service: BorrowingService;

  const mockTransaction = {
    id: '1',
    book_id: 'book1',
    borrower_id: 'bor1',
  };

  const mockBorrowingService = {
    checkoutBook: jest.fn().mockResolvedValue(mockTransaction),
    returnBook: jest.fn().mockResolvedValue(mockTransaction),
    findAll: jest.fn().mockResolvedValue({ data: [mockTransaction], pagination: {} }),
    getOverdueBooks: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
    getBorrowerBooks: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
    getBorrowerHistory: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
    findById: jest.fn().mockResolvedValue(mockTransaction),
    getAnalytics: jest.fn().mockResolvedValue({ summary: {}, topBooks: [] }),
    exportData: jest.fn().mockResolvedValue({ buffer: Buffer.from(''), filename: 'test.csv', contentType: 'text/csv' }),
  };

  const mockRes = {
    setHeader: jest.fn(),
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BorrowingController],
      providers: [
        {
          provide: BorrowingService,
          useValue: mockBorrowingService,
        },
      ],
    }).compile();

    controller = module.get<BorrowingController>(BorrowingController);
    service = module.get<BorrowingService>(BorrowingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkout', () => {
    it('should checkout a book', async () => {
      const dto = { book_id: 'b1', borrower_id: 'bor1' };
      await controller.checkout(dto);
      expect(service.checkoutBook).toHaveBeenCalledWith(dto);
    });
  });

  describe('return', () => {
    it('should return a book', async () => {
      const dto = { transaction_id: '1' };
      await controller.return(dto);
      expect(service.returnBook).toHaveBeenCalledWith(dto);
    });
  });

  describe('exportData', () => {
    it('should call exportData and set headers', async () => {
      const filters = { format: ExportFormat.CSV };
      await controller.exportData(filters, mockRes as any);
      expect(service.exportData).toHaveBeenCalled();
      expect(mockRes.setHeader).toHaveBeenCalled();
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('getAnalytics', () => {
    it('should call getAnalytics', async () => {
      const filters = { startDate: '2025-01-01' };
      await controller.getAnalytics(filters);
      expect(service.getAnalytics).toHaveBeenCalledWith(filters);
    });
  });
});
