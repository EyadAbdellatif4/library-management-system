export interface IBorrowingTransaction {
  id: string;
  book_id: string;
  borrower_id: string;
  checkout_date: Date;
  due_date: Date;
  return_date?: Date;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
