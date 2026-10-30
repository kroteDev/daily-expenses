import type { RawPaginationMetaDto } from "@/domain/api/RawPaginationMetaDto";
import type { PaginationMeta } from "@/domain/entities/Pagination";

export function rawToPaginationMeta(raw: RawPaginationMetaDto): PaginationMeta {
  return {
    page: raw.page,
    perPage: raw.per_page,
    total: raw.total,
    totalPages: raw.total_pages,
  };
}
