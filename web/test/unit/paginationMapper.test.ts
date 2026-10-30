import { describe, expect, it } from "vitest";
import type { RawPaginationMetaDto } from "@/domain/api/RawPaginationMetaDto";
import { rawToPaginationMeta } from "@/infrastructure/api/mappers/paginationMapper";

describe("rawToPaginationMeta", () => {
  it("maps snake_case pagination metadata to camelCase", () => {
    const raw: RawPaginationMetaDto = { page: 2, per_page: 50, total: 168, total_pages: 4 };

    expect(rawToPaginationMeta(raw)).toEqual({ page: 2, perPage: 50, total: 168, totalPages: 4 });
  });
});
