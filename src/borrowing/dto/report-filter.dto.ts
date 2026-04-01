import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export class AnalyticsFilterDto {
  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'The start date for the report',
  })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'The end date for the report',
  })
  endDate?: string;
}

export class ExportFilterDto extends AnalyticsFilterDto {
  @IsOptional()
  @IsEnum(['csv', 'xlsx'])
  @ApiPropertyOptional({
    enum: ['csv', 'xlsx'],
    description: 'The format of the export',
    default: 'csv',
  })
  format?: 'csv' | 'xlsx';
}
