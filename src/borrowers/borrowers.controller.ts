import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBasicAuth } from '@nestjs/swagger';
import { BorrowersService } from './borrowers.service';
import { CreateBorrowerDto } from './dto/create-borrower.dto';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';
import { BorrowersFilterDto } from './dto/borrowers-filter.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('borrowers')
@ApiBasicAuth('basic')
@Controller('borrowers')
export class BorrowersController {
  constructor(private readonly borrowersService: BorrowersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new borrower' })
  @ApiResponse({ status: 201, description: 'Borrower registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  create(@Body() createBorrowerDto: CreateBorrowerDto) {
    return this.borrowersService.create(createBorrowerDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List all borrowers with optional filtering and searching',
  })
  @ApiResponse({ status: 200, description: 'Borrowers retrieved successfully' })
  findAll(@Query() filterDto: BorrowersFilterDto) {
    return this.borrowersService.findAll(filterDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get borrower details by ID' })
  @ApiResponse({ status: 200, description: 'Borrower details' })
  @ApiResponse({ status: 404, description: 'Borrower not found' })
  findOne(@Param('id') id: string) {
    return this.borrowersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update borrower's details" })
  @ApiResponse({ status: 200, description: 'Borrower updated successfully' })
  @ApiResponse({ status: 404, description: 'Borrower not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  update(
    @Param('id') id: string,
    @Body() updateBorrowerDto: UpdateBorrowerDto,
  ) {
    return this.borrowersService.update(id, updateBorrowerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a borrower' })
  @ApiResponse({ status: 200, description: 'Borrower deleted successfully' })
  @ApiResponse({ status: 404, description: 'Borrower not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  remove(@Param('id') id: string) {
    return this.borrowersService.remove(id);
  }
}
