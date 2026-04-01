import { Book } from '../../books/entities/book.entity';
import { Borrower } from '../../borrowers/entities/borrower.entity';
import { BorrowingTransaction } from '../../borrowing/entities/borrowing-transaction.entity';

export default () => {
  return [Book, Borrower, BorrowingTransaction];
};
