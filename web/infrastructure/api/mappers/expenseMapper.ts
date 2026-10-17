import type { ExpenseRequestDto } from "@/domain/api/ExpenseRequests";
import type { RawExpenseDto } from "@/domain/api/RawExpenseDto";
import type { Expense } from "@/domain/entities/Expense";
import type { ExpenseInput } from "@/domain/repositories/IExpenseRepository";

export function rawToExpense(raw: RawExpenseDto): Expense {
  return {
    id: raw.id,
    name: raw.name,
    date: raw.date,
    priceCents: raw.price_cents,
    categoryId: raw.category_id,
    importHash: raw.import_hash,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
  };
}

export function toRawExpense(input: ExpenseInput): ExpenseRequestDto {
  return {
    expense: {
      name: input.name,
      date: input.date,
      price_cents: input.priceCents,
      category_id: input.categoryId,
    },
  };
}
