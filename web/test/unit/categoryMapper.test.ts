import { describe, expect, it } from "vitest";
import type { RawCategoryDto } from "@/domain/api/RawCategoryDto";
import { rawToCategory, toRawCategory } from "@/infrastructure/api/mappers/categoryMapper";

const raw: RawCategoryDto = {
  id: "7f0c1a2e-0000-4000-8000-000000000001",
  name: "Alimentação",
  user_id: 1,
  created_at: "2026-10-08T23:06:12.292Z",
  updated_at: "2026-10-09T10:00:00.000Z",
};

describe("rawToCategory", () => {
  it("maps snake_case to camelCase and parses dates", () => {
    expect(rawToCategory(raw)).toEqual({
      id: "7f0c1a2e-0000-4000-8000-000000000001",
      name: "Alimentação",
      createdAt: new Date("2026-10-08T23:06:12.292Z"),
      updatedAt: new Date("2026-10-09T10:00:00.000Z"),
    });
  });
});

describe("toRawCategory", () => {
  it("builds the exact wire payload", () => {
    expect(toRawCategory({ name: "Lazer" })).toEqual({
      category: { name: "Lazer" },
    });
  });
});
