import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../books/entities/book.entity';
import { Borrower } from '../../borrowers/entities/borrower.entity';

/**
 * BorrowingTransaction is a model that represents a borrowing transaction
 */
@Table({
  tableName: 'borrowing_transactions',
  timestamps: true,
})
export class BorrowingTransaction extends Model<BorrowingTransaction> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  @ApiProperty({ example: 'uuid', description: 'The ID of the transaction' })
  declare id: string;

  @ForeignKey(() => Book)
  @Column(DataType.UUID)
  @ApiProperty({ example: 'uuid', description: 'The ID of the book' })
  declare book_id: string;

  @BelongsTo(() => Book)
  book: Book;

  @ForeignKey(() => Borrower)
  @Column(DataType.UUID)
  @ApiProperty({ example: 'uuid', description: 'The ID of the borrower' })
  declare borrower_id: string;

  @BelongsTo(() => Borrower)
  borrower: Borrower;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  @ApiProperty({
    example: '2025-01-01',
    description: 'The check-out date',
  })
  declare checkout_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  @ApiProperty({
    example: '2025-02-01',
    description: 'The due date for returning the book',
  })
  declare due_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({
    example: '2025-01-15',
    description: 'The return date (null if not returned yet)',
  })
  declare return_date: Date;

  @Column({
    type: DataType.ENUM('BORROWED', 'RETURNED', 'OVERDUE'),
    allowNull: false,
    defaultValue: 'BORROWED',
  })
  @ApiProperty({
    example: 'BORROWED',
    description: 'The status of the borrowing',
  })
  declare status: 'BORROWED' | 'RETURNED' | 'OVERDUE';

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({
    example: '2025-01-01 12:00:00',
    description: 'The deleted at date',
  })
  declare deletedAt: Date;
}
