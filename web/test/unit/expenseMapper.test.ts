import { describe, expect, it } from "vitest";
import type { RawExpenseDto } from "@/domain/api/RawExpenseDto";
import { rawToExpense, toRawExpense } from "@/infrastructure/api/mappers/expenseMapper";

const raw: RawExpenseDto = {
  id: "9b1d2c3e-0000-4000-8000-000000000002",
  name: "Mercado",
  date: "2026-10-14",
  price_cents: 12345,
  category_id: "7f0c1a2e-0000-4000-8000-000000000001",
  user_id: 1,
  import_hash: null,
  created_at: "2026-10-14T12:00:00.000Z",
  updated_at: "2026-10-14T12:00:00.000Z",
};

describe("rawToExpense", () => {
  it("maps snake_case to camelCase and keeps the date as yyyy-mm-dd", () => {
    expect(rawToExpense(raw)).toEqual({
      id: "9b1d2c3e-0000-4000-8000-000000000002",
      name: "Mercado",
      date: "2026-10-14",
      priceCents: 12345,
      categoryId: "7f0c1a2e-0000-4000-8000-000000000001",
      importHash: null,
      createdAt: new Date("2026-10-14T12:00:00.000Z"),
      updatedAt: new Date("2026-10-14T12:00:00.000Z"),
    });
  });
});

describe("toRawExpense", () => {
  it("builds the exact wire payload", () => {
    expect(
      toRawExpense({
        name: "Mercado",
        date: "2026-10-14",
        priceCents: 12345,
        categoryId: "7f0c1a2e-0000-4000-8000-000000000001",
      }),
    ).toEqual({
      expense: {
        name: "Mercado",
        date: "2026-10-14",
        price_cents: 12345,
        category_id: "7f0c1a2e-0000-4000-8000-000000000001",
      },
    });
  });
});
