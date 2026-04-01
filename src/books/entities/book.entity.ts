import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Default,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Book is a model that represents a book in the library
 */
@Table({
  tableName: 'books',
  timestamps: true,
})
export class Book extends Model<Book> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  @ApiProperty({ example: 'uuid', description: 'The ID of the book' })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  @ApiProperty({
    example: 'The Great Gatsby',
    description: 'The title of the book',
  })
  declare title: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  @ApiProperty({
    example: 'F. Scott Fitzgerald',
    description: 'The author of the book',
  })
  declare author: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true,
  })
  @ApiProperty({
    example: '978-0-7432-7356-5',
    description: 'The ISBN of the book',
  })
  declare isbn: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  @ApiProperty({
    example: 5,
    description: 'The quantity of available copies',
  })
  declare available_quantity: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  @ApiProperty({
    example: 2,
    description: 'The quantity of borrowed copies',
  })
  declare borrowed_quantity: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  @ApiProperty({
    example: 'A1-2-3',
    description: 'The shelf location of the book',
  })
  declare shelf_location: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  @ApiProperty({
    example: 'A classic American novel',
    description: 'A description of the book',
  })
  declare description: string;

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
