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
 * Borrower is a model that represents a borrower in the library
 */
@Table({
  tableName: 'borrowers',
  timestamps: true,
})
export class Borrower extends Model<Borrower> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  @ApiProperty({ example: 'uuid', description: 'The ID of the borrower' })
  declare id: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the borrower',
  })
  declare name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  @ApiProperty({
    example: 'john@example.com',
    description: 'The email of the borrower',
  })
  declare email: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the borrower',
  })
  declare phone: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  @ApiProperty({
    example: '2025-01-01',
    description: 'The registration date of the borrower',
  })
  declare registered_date: Date;



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
