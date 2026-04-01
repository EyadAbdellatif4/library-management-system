import { IsString, IsISBN, IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'The Great Gatsby',
    description: 'The title of the book',
  })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'F. Scott Fitzgerald',
    description: 'The author of the book',
  })
  author?: string;

  @IsOptional()
  @IsISBN()
  @ApiPropertyOptional({
    example: '978-0-7432-7356-5',
    description: 'The ISBN of the book',
  })
  isbn?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({
    example: 5,
    description: 'The quantity of available copies',
  })
  available_quantity?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'A1-2-3',
    description: 'The shelf location of the book',
  })
  shelf_location?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'A classic American novel',
    description: 'A description of the book',
  })
  description?: string;
}
