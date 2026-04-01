import { IsEmail, IsString, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBorrowerDto {
  @IsString()
  @ApiProperty({ example: 'John Doe', description: 'The name of the borrower' })
  name: string;

  @IsEmail()
  @ApiProperty({
    example: 'john@example.com',
    description: 'The email of the borrower',
  })
  email: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'The phone number of the borrower',
  })
  phone?: string;
}
