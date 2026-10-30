import type { ApiEnvelopeRequestFn } from "@/infrastructure/api/httpClient";
import { buildQuery } from "@/infrastructure/api/httpClient";
import type { RawCsvImportResultDto } from "@/domain/api/RawCsvImportResultDto";
import type { RawExpenseDto } from "@/domain/api/RawExpenseDto";
import type { RawPaginationMetaDto } from "@/domain/api/RawPaginationMetaDto";
import type { CsvImportResult } from "@/domain/entities/CsvImportResult";
import type { Expense } from "@/domain/entities/Expense";
import type { PaginatedResult } from "@/domain/entities/Pagination";
import type { PeriodListOptions } from "@/domain/repositories/ListOptions";
import type {
  ExpenseInput,
  IExpenseRepository,
} from "@/domain/repositories/IExpenseRepository";
import { rawToCsvImportResult } from "@/infrastructure/api/mappers/csvImportMapper";
import { rawToExpense, toRawExpense } from "@/infrastructure/api/mappers/expenseMapper";
import { rawToPaginationMeta } from "@/infrastructure/api/mappers/paginationMapper";

export class HttpExpenseRepository implements IExpenseRepository {
  private readonly request: ApiEnvelopeRequestFn;

  constructor(request: ApiEnvelopeRequestFn) {
    this.request = request;
  }

  async list(token: string, options: PeriodListOptions = {}): Promise<PaginatedResult<Expense>> {
    const params: Record<string, string | undefined> = {
      sort: options.sort,
      page: options.page?.toString(),
    };
    if (options.period) params[options.period] = "1";
    const { data, meta } = await this.request<RawExpenseDto[], RawPaginationMetaDto>({
      method: "GET",
      path: `/api/v1/expenses${buildQuery(params)}`,
      token,
    });
    return { items: data.map(rawToExpense), meta: rawToPaginationMeta(meta) };
  }

  async get(token: string, id: string): Promise<Expense> {
    const { data } = await this.request<RawExpenseDto>({
      method: "GET",
      path: `/api/v1/expenses/${id}`,
      token,
    });
    return rawToExpense(data);
  }

  async create(token: string, input: ExpenseInput): Promise<Expense> {
    const { data } = await this.request<RawExpenseDto>({
      method: "POST",
      path: "/api/v1/expenses",
      token,
      body: toRawExpense(input),
    });
    return rawToExpense(data);
  }

  async update(token: string, id: string, input: ExpenseInput): Promise<Expense> {
    const { data } = await this.request<RawExpenseDto>({
      method: "PATCH",
      path: `/api/v1/expenses/${id}`,
      token,
      body: toRawExpense(input),
    });
    return rawToExpense(data);
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
    const { data } = await this.request<RawCsvImportResultDto>({
      method: "POST",
      path: "/api/v1/expenses/import_csv",
      token,
      body,
    });
    return rawToCsvImportResult(data);
  }
}
