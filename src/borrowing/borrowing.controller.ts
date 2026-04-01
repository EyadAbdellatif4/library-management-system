import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Res,
 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBasicAuth } from '@nestjs/swagger';
import { BorrowingService } from './borrowing.service';
import { CheckoutBookDto } from './dto/checkout-book.dto';
import { ReturnBookDto } from './dto/return-book.dto';
import { BorrowingFilterDto } from './dto/borrowing-filter.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Response } from 'express';
import { AnalyticsFilterDto, ExportFilterDto, MonthExportDto, ExportFormat } from './dto/report-filter.dto';

@ApiTags('borrowing')
@ApiBasicAuth('basic')
@Controller('borrowing')
export class BorrowingController {
  constructor(private readonly borrowingService: BorrowingService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Checkout a book for a borrower' })
  @ApiResponse({ status: 201, description: 'Book checked out successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - book not available or borrower inactive',
  })
  @ApiResponse({ status: 404, description: 'Book or borrower not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  checkout(@Body() checkoutBookDto: CheckoutBookDto) {
    return this.borrowingService.checkoutBook(checkoutBookDto);
  }

  @Post('return')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return a book' })
  @ApiResponse({ status: 200, description: 'Book returned successfully' })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found or already returned',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  return(@Body() returnBookDto: ReturnBookDto) {
    return this.borrowingService.returnBook(returnBookDto);
  }

  @Get('transactions')
  @Public()
  @ApiOperation({
    summary: 'List all borrowing transactions with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  findAll(@Query() filterDto: BorrowingFilterDto) {
    return this.borrowingService.findAll(filterDto);
  }

  @Get('borrower/:borrowerId/books')
  @Public()
  @ApiOperation({ summary: 'Get books currently checked out by a borrower' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Borrower books retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Borrower not found' })
  getBorrowerBooks(
    @Param('borrowerId') borrowerId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.borrowingService.getBorrowerBooks(borrowerId, page, limit);
  }

  @Get('borrower/:borrowerId/history')
  @Public()
  @ApiOperation({ summary: 'Get borrowing history of a borrower' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Borrowing history retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Borrower not found' })
  getBorrowerHistory(
    @Param('borrowerId') borrowerId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.borrowingService.getBorrowerHistory(borrowerId, page, limit);
  }

  @Get('overdue')
  @Public()
  @ApiOperation({ summary: 'List overdue books' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Overdue books retrieved successfully',
  })
  getOverdueBooks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.borrowingService.getOverdueBooks(page, limit);
  }

  @Get('transaction/:id')
  @Public()
  @ApiOperation({ summary: 'Get transaction details' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(@Param('id') id: string) {
    return this.borrowingService.findById(id);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytical reports of the borrowing process' })
  @ApiResponse({
    status: 200,
    description: 'Analytical reports retrieved successfully',
  })
  getAnalytics(@Query() filter: AnalyticsFilterDto) {
    return this.borrowingService.getAnalytics(filter);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export borrowing process data' })
  @ApiResponse({ status: 200, description: 'Data exported successfully' })
  async exportData(
    @Query() filter: ExportFilterDto,
    @Res() res: Response,
  ) {
    const { buffer, filename, contentType } =
      await this.borrowingService.exportData(filter);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    res.send(buffer);
  }

  @Get('export/last-month')
  @ApiOperation({ summary: 'Export all borrowing processes of the last month' })
  async exportLastMonth(
    @Res() res: Response,
    @Query() query: MonthExportDto,
  ) {
    const format = query.format || ExportFormat.CSV;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    return this.exportData(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format,
      },
      res,
    );
  }

  @Get('export/overdue-last-month')
  @ApiOperation({ summary: 'Export all overdue borrows of the last month' })
  async exportOverdueLastMonth(
    @Res() res: Response,
    @Query() query: MonthExportDto,
  ) {
    const format = query.format || ExportFormat.CSV;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    return this.exportData(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format,
        status: 'OVERDUE',
      },
      res,
    );
  }
}
