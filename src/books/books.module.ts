import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './entities/book.entity';

@Module({
  imports: [SequelizeModule.forFeature([Book])],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
