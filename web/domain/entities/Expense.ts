export interface Expense {
  id: string;
  name: string;
  date: string;
  priceCents: number;
  categoryId: string;
  importHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}
