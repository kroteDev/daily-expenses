import type { CsvImportResult } from "@/domain/entities/CsvImportResult";
import type { Expense } from "@/domain/entities/Expense";
import type { PeriodListOptions } from "@/domain/repositories/ListOptions";

export interface ExpenseInput {
  name: string;
  date: string;
  priceCents: number;
  categoryId: string;
}

export interface IExpenseRepository {
  list(token: string, options?: PeriodListOptions): Promise<Expense[]>;
  get(token: string, id: string): Promise<Expense>;
  create(token: string, input: ExpenseInput): Promise<Expense>;
  update(token: string, id: string, input: ExpenseInput): Promise<Expense>;
  delete(token: string, id: string): Promise<void>;
  importCsv(token: string, file: File): Promise<CsvImportResult>;
}
