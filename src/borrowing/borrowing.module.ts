import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BorrowingService } from './borrowing.service';
import { BorrowingController } from './borrowing.controller';
import { BorrowingTransaction } from './entities/borrowing-transaction.entity';
import { BooksModule } from '../books/books.module';
import { BorrowersModule } from '../borrowers/borrowers.module';
import { CronService } from '../shared/utils/cron.service';

@Module({
  imports: [
    SequelizeModule.forFeature([BorrowingTransaction]),
    BooksModule,
    BorrowersModule,
  ],
  controllers: [BorrowingController],
  providers: [BorrowingService, CronService],
  exports: [BorrowingService],
})
export class BorrowingModule {}
