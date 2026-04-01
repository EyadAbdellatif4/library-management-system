export interface IBorrower {
  id: string;
  name: string;
  email: string;
  phone?: string;
  registered_date: Date;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
