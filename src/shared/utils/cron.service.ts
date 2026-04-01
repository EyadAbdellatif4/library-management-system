import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { BorrowingTransaction } from '../../borrowing/entities/borrowing-transaction.entity';
import { Op, Sequelize as Sql } from 'sequelize';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectModel(BorrowingTransaction)
    private borrowingTransactionModel: typeof BorrowingTransaction,
  ) {}

  /**
   * Cron job that checks every 1 minute if a book became overdue
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleOverdueCron() {
    this.logger.log('Running cron job to update overdue books...');

    const [affectedCount] = await this.borrowingTransactionModel.update(
      { status: 'OVERDUE' },
      {
        where: {
          status: 'BORROWED',
          checkout_date: { [Op.gt]: Sql.col('due_date') },
          deletedAt: null,
        } as any,
      },
    );

    if (affectedCount > 0) {
      this.logger.log(`Successfully updated ${affectedCount} books to OVERDUE`);
    }
  }
}
