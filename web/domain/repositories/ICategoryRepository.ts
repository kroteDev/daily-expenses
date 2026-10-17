import type { Category } from "@/domain/entities/Category";
import type { ListOptions } from "@/domain/repositories/ListOptions";

export interface CategoryInput {
  name: string;
}

export interface ICategoryRepository {
  list(token: string, options?: ListOptions): Promise<Category[]>;
  get(token: string, id: string): Promise<Category>;
  create(token: string, input: CategoryInput): Promise<Category>;
  update(token: string, id: string, input: CategoryInput): Promise<Category>;
  delete(token: string, id: string): Promise<void>;
}
