export interface IBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  available_quantity: number;
  borrowed_quantity: number;
  shelf_location: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
