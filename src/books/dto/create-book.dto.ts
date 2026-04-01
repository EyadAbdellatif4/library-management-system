import { IsString, IsISBN, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @IsString()
  @ApiProperty({
    example: 'The Great Gatsby',
    description: 'The title of the book',
  })
  title: string;

  @IsString()
  @ApiProperty({
    example: 'F. Scott Fitzgerald',
    description: 'The author of the book',
  })
  author: string;

  @IsISBN()
  @ApiProperty({
    example: '978-0-7432-7356-5',
    description: 'The ISBN of the book',
  })
  isbn: string;

  @IsInt()
  @Min(0)
  @ApiProperty({ example: 5, description: 'The quantity of available copies' })
  available_quantity: number;

  @IsString()
  @ApiProperty({
    example: 'A1-2-3',
    description: 'The shelf location of the book',
  })
  shelf_location: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'A classic American novel',
    description: 'A description of the book',
  })
  description?: string;
}
