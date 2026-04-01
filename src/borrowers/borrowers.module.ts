import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BorrowersService } from './borrowers.service';
import { BorrowersController } from './borrowers.controller';
import { Borrower } from './entities/borrower.entity';

@Module({
  imports: [SequelizeModule.forFeature([Borrower])],
  controllers: [BorrowersController],
  providers: [BorrowersService],
  exports: [BorrowersService],
})
export class BorrowersModule {}
