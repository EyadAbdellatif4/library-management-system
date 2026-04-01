import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBorrowerDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'The name of the borrower',
  })
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'The email of the borrower',
  })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'The phone number of the borrower',
  })
  phone?: string;
}
