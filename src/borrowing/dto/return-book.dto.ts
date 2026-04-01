import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReturnBookDto {
  @IsUUID()
  @ApiProperty({
    example: 'uuid',
    description: 'The ID of the borrowing transaction',
  })
  transaction_id: string;
}
