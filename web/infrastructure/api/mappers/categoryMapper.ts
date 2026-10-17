import type { CategoryRequestDto } from "@/domain/api/CategoryRequests";
import type { RawCategoryDto } from "@/domain/api/RawCategoryDto";
import type { Category } from "@/domain/entities/Category";
import type { CategoryInput } from "@/domain/repositories/ICategoryRepository";

export function rawToCategory(raw: RawCategoryDto): Category {
  return {
    id: raw.id,
    name: raw.name,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
  };
}

export function toRawCategory(input: CategoryInput): CategoryRequestDto {
  return {
    category: {
      name: input.name,
    },
  };
}
