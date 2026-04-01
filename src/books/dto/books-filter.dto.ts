import { IsOptional, IsString, IsISBN } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseFilterDto } from '../../shared/dto/base-filter.dto';

/**
 * Books Filter DTO extending BaseFilterDto with book-specific filters
 */
export class BooksFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by book title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Filter by author name',
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({
    description: 'Filter by ISBN',
  })
  @IsOptional()
  @IsISBN()
  isbn?: string;
}
