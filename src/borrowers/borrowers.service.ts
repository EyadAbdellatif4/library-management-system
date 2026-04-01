import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Borrower } from './entities/borrower.entity';
import { CreateBorrowerDto } from './dto/create-borrower.dto';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';
import { BorrowersFilterDto } from './dto/borrowers-filter.dto';
import { IBorrower } from './interfaces/borrower.interface';
import { Op, WhereOptions } from 'sequelize';

@Injectable()
export class BorrowersService {
  constructor(
    @InjectModel(Borrower)
    private borrowerModel: typeof Borrower,
  ) { }

  /**
   * Register a new borrower
   */
  async create(createBorrowerDto: CreateBorrowerDto): Promise<IBorrower> {
    // Check if email already exists
    const existingBorrower = await this.borrowerModel.findOne({
      where: { email: createBorrowerDto.email },
    });

    if (existingBorrower) {
      throw new BadRequestException(
        'A borrower with this email already exists',
      );
    }

    const borrower = await this.borrowerModel.create({
      ...createBorrowerDto,
      registered_date: new Date(),
    } as any);

    return borrower as IBorrower;
  }

  /**
   * Find all borrowers with optional filtering, searching, pagination, and sorting
   */
  async findAll(filterDto: BorrowersFilterDto) {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;
    const sortBy = filterDto.sortBy || 'createdAt';
    const sortOrder = filterDto.sortOrder || 'DESC';

    // Build where clause
    const whereConditions: any[] = [{ deletedAt: null }];

    // Add search across multiple fields
    if (filterDto.search) {
      whereConditions.push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${filterDto.search}%` } },
          { email: { [Op.iLike]: `%${filterDto.search}%` } },
        ],
      });
    }

    // Add specific field filters
    if (filterDto.name) {
      whereConditions.push({ name: { [Op.iLike]: `%${filterDto.name}%` } });
    }
    if (filterDto.email) {
      whereConditions.push({ email: { [Op.iLike]: `%${filterDto.email}%` } });
    }



    const { count, rows } = await this.borrowerModel.findAndCountAll({
      where: { [Op.and]: whereConditions } as any,
      offset,
      limit,
      order: [[sortBy, sortOrder]],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Find a borrower by ID
   */
  async findById(id: string): Promise<Borrower> {
    const borrower = await this.borrowerModel.findOne({
      where: {
        id,
        deletedAt: null,
      } as any,
    });

    if (!borrower) {
      throw new NotFoundException(`Borrower with ID ${id} not found or deleted`);
    }

    return borrower;
  }

  /**
   * Update a borrower's details
   */
  async update(id: string, updateBorrowerDto: UpdateBorrowerDto) {
    const borrower = await this.findById(id);

    // Check if email is being updated to an existing email
    if (updateBorrowerDto.email && updateBorrowerDto.email !== borrower.email) {
      const existingBorrower = await this.borrowerModel.findOne({
        where: { email: updateBorrowerDto.email },
      });

      if (existingBorrower) {
        throw new BadRequestException(
          'A borrower with this email already exists',
        );
      }
    }

    await borrower.update(updateBorrowerDto);
    return borrower;
  }

  /**
   * Delete a borrower (soft delete)
   */
  async remove(id: string) {
    const borrower = await this.findById(id);
    borrower.deletedAt = new Date();
    await borrower.save();
    return { message: 'Borrower deleted successfully' };
  }


}
