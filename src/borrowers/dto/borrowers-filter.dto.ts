import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseFilterDto } from '../../shared/dto/base-filter.dto';

/**
 * Borrowers Filter DTO extending BaseFilterDto with borrower-specific filters
 */
export class BorrowersFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by borrower name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by borrower email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
