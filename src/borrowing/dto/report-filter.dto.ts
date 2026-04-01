import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum ExportFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
}

export class BaseReportDto {
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

export class AnalyticsFilterDto extends BaseReportDto {
  @IsOptional()
  @ApiPropertyOptional({
    enum: ['BORROWED', 'RETURNED', 'OVERDUE'],
    description: 'Filter by borrowing status',
  })
  status?: 'BORROWED' | 'RETURNED' | 'OVERDUE';
}

export class ExportFilterDto extends BaseReportDto {
  @IsOptional()
  @IsEnum(ExportFormat)
  @ApiPropertyOptional({
    enum: ExportFormat,
    description: 'The format of the export',
    default: ExportFormat.CSV,
  })
  format?: ExportFormat;

  @IsOptional()
  status?: 'BORROWED' | 'RETURNED' | 'OVERDUE';
}

export class MonthExportDto {
  @IsOptional()
  @IsEnum(ExportFormat)
  @ApiPropertyOptional({
    enum: ExportFormat,
    description: 'The format of the export',
    default: ExportFormat.CSV,
  })
  format?: ExportFormat;
}
