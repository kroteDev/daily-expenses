import type { Category } from "@/domain/entities/Category";
import type {
  CategoryInput,
  ICategoryRepository,
} from "@/domain/repositories/ICategoryRepository";
import type { ListOptions } from "@/domain/repositories/ListOptions";
import type { TokenStore } from "@/infrastructure/auth/tokenStore";
import { requireToken } from "@/usecases/auth";

export async function listCategories(
  repo: ICategoryRepository,
  store: TokenStore,
  options?: ListOptions,
): Promise<Category[]> {
  return repo.list(requireToken(store), options);
}

export async function getCategory(repo: ICategoryRepository, store: TokenStore, id: string): Promise<Category> {
  return repo.get(requireToken(store), id);
}

export async function createCategory(
  repo: ICategoryRepository,
  store: TokenStore,
  input: CategoryInput,
): Promise<Category> {
  return repo.create(requireToken(store), input);
}

export async function updateCategory(
  repo: ICategoryRepository,
  store: TokenStore,
  id: string,
  input: CategoryInput,
): Promise<Category> {
  return repo.update(requireToken(store), id, input);
}

export async function deleteCategory(repo: ICategoryRepository, store: TokenStore, id: string): Promise<void> {
  return repo.delete(requireToken(store), id);
}
