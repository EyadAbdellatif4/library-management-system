import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseFilterDto } from '../../shared/dto/base-filter.dto';

/**
 * Borrowing Filter DTO extending BaseFilterDto with borrowing-specific filters
 */
export class BorrowingFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by borrower ID',
  })
  @IsOptional()
  @IsUUID()
  borrowerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by book ID',
  })
  @IsOptional()
  @IsUUID()
  bookId?: string;

  @ApiPropertyOptional({
    description: 'Filter by transaction status',
    enum: ['BORROWED', 'RETURNED', 'OVERDUE'],
  })
  @IsOptional()
  @IsEnum(['BORROWED', 'RETURNED', 'OVERDUE'])
  status?: 'BORROWED' | 'RETURNED' | 'OVERDUE';
}
