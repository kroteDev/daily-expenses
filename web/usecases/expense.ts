import type { CsvImportResult } from "@/domain/entities/CsvImportResult";
import type { Expense } from "@/domain/entities/Expense";
import type {
  ExpenseInput,
  IExpenseRepository,
} from "@/domain/repositories/IExpenseRepository";
import type { PeriodListOptions } from "@/domain/repositories/ListOptions";
import type { TokenStore } from "@/infrastructure/auth/tokenStore";
import { requireToken } from "@/usecases/auth";

export async function listExpenses(
  repo: IExpenseRepository,
  store: TokenStore,
  options?: PeriodListOptions,
): Promise<Expense[]> {
  return repo.list(requireToken(store), options);
}

export async function getExpense(repo: IExpenseRepository, store: TokenStore, id: string): Promise<Expense> {
  return repo.get(requireToken(store), id);
}

export async function createExpense(
  repo: IExpenseRepository,
  store: TokenStore,
  input: ExpenseInput,
): Promise<Expense> {
  return repo.create(requireToken(store), input);
}

export async function updateExpense(
  repo: IExpenseRepository,
  store: TokenStore,
  id: string,
  input: ExpenseInput,
): Promise<Expense> {
  return repo.update(requireToken(store), id, input);
}

export async function deleteExpense(repo: IExpenseRepository, store: TokenStore, id: string): Promise<void> {
  return repo.delete(requireToken(store), id);
}

export async function importExpensesCsv(
  repo: IExpenseRepository,
  store: TokenStore,
  file: File,
): Promise<CsvImportResult> {
  return repo.importCsv(requireToken(store), file);
}
