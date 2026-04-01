import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckoutBookDto {
  @IsUUID()
  @ApiProperty({
    example: 'uuid',
    description: 'The ID of the book to checkout',
  })
  book_id: string;

  @IsUUID()
  @ApiProperty({ example: 'uuid', description: 'The ID of the borrower' })
  borrower_id: string;
}
