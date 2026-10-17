import type { ApiRequestFn } from "@/infrastructure/api/httpClient";
import { buildQuery } from "@/infrastructure/api/httpClient";
import type { RawCategoryDto } from "@/domain/api/RawCategoryDto";
import type { Category } from "@/domain/entities/Category";
import type { ListOptions } from "@/domain/repositories/ListOptions";
import type {
  CategoryInput,
  ICategoryRepository,
} from "@/domain/repositories/ICategoryRepository";
import { rawToCategory, toRawCategory } from "@/infrastructure/api/mappers/categoryMapper";

export class HttpCategoryRepository implements ICategoryRepository {
  private readonly request: ApiRequestFn;

  constructor(request: ApiRequestFn) {
    this.request = request;
  }

  async list(token: string, options: ListOptions = {}): Promise<Category[]> {
    const raw = await this.request<RawCategoryDto[]>({
      method: "GET",
      path: `/api/v1/categories${buildQuery({ sort: options.sort })}`,
      token,
    });
    return raw.map(rawToCategory);
  }

  async get(token: string, id: string): Promise<Category> {
    const raw = await this.request<RawCategoryDto>({
      method: "GET",
      path: `/api/v1/categories/${id}`,
      token,
    });
    return rawToCategory(raw);
  }

  async create(token: string, input: CategoryInput): Promise<Category> {
    const raw = await this.request<RawCategoryDto>({
      method: "POST",
      path: "/api/v1/categories",
      token,
      body: toRawCategory(input),
    });
    return rawToCategory(raw);
  }

  async update(token: string, id: string, input: CategoryInput): Promise<Category> {
    const raw = await this.request<RawCategoryDto>({
      method: "PATCH",
      path: `/api/v1/categories/${id}`,
      token,
      body: toRawCategory(input),
    });
    return rawToCategory(raw);
  }

  async delete(token: string, id: string): Promise<void> {
    await this.request<void>({
      method: "DELETE",
      path: `/api/v1/categories/${id}`,
      token,
    });
  }
}
