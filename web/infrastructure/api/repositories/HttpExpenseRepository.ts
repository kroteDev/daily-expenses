import type { ApiRequestFn } from "@/infrastructure/api/httpClient";
import { buildQuery } from "@/infrastructure/api/httpClient";
import type { RawCsvImportResultDto } from "@/domain/api/RawCsvImportResultDto";
import type { RawExpenseDto } from "@/domain/api/RawExpenseDto";
import type { CsvImportResult } from "@/domain/entities/CsvImportResult";
import type { Expense } from "@/domain/entities/Expense";
import type { PeriodListOptions } from "@/domain/repositories/ListOptions";
import type {
  ExpenseInput,
  IExpenseRepository,
} from "@/domain/repositories/IExpenseRepository";
import { rawToCsvImportResult } from "@/infrastructure/api/mappers/csvImportMapper";
import { rawToExpense, toRawExpense } from "@/infrastructure/api/mappers/expenseMapper";

export class HttpExpenseRepository implements IExpenseRepository {
  private readonly request: ApiRequestFn;

  constructor(request: ApiRequestFn) {
    this.request = request;
  }

  async list(token: string, options: PeriodListOptions = {}): Promise<Expense[]> {
    const params: Record<string, string | undefined> = { sort: options.sort };
    if (options.period) params[options.period] = "1";
    const raw = await this.request<RawExpenseDto[]>({
      method: "GET",
      path: `/api/v1/expenses${buildQuery(params)}`,
      token,
    });
    return raw.map(rawToExpense);
  }

  async get(token: string, id: string): Promise<Expense> {
    const raw = await this.request<RawExpenseDto>({
      method: "GET",
      path: `/api/v1/expenses/${id}`,
      token,
    });
    return rawToExpense(raw);
  }

  async create(token: string, input: ExpenseInput): Promise<Expense> {
    const raw = await this.request<RawExpenseDto>({
      method: "POST",
      path: "/api/v1/expenses",
      token,
      body: toRawExpense(input),
    });
    return rawToExpense(raw);
  }

  async update(token: string, id: string, input: ExpenseInput): Promise<Expense> {
    const raw = await this.request<RawExpenseDto>({
      method: "PATCH",
      path: `/api/v1/expenses/${id}`,
      token,
      body: toRawExpense(input),
    });
    return rawToExpense(raw);
  }

  async delete(token: string, id: string): Promise<void> {
    await this.request<void>({
      method: "DELETE",
      path: `/api/v1/expenses/${id}`,
      token,
    });
  }

  async importCsv(token: string, file: File): Promise<CsvImportResult> {
    const body = new FormData();
    body.append("file", file);
    const raw = await this.request<RawCsvImportResultDto>({
      method: "POST",
      path: "/api/v1/expenses/import_csv",
      token,
      body,
    });
    return rawToCsvImportResult(raw);
  }
}
