import { describe, expect, it, vi } from "vitest";
import type { Category } from "@/domain/entities/Category";
import type { Expense } from "@/domain/entities/Expense";
import type { Incoming } from "@/domain/entities/Incoming";
import type { ICategoryRepository } from "@/domain/repositories/ICategoryRepository";
import type { IExpenseRepository } from "@/domain/repositories/IExpenseRepository";
import type { IIncomingRepository } from "@/domain/repositories/IIncomingRepository";
import type { TokenStore } from "@/infrastructure/auth/tokenStore";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/usecases/category";
import { createExpense, deleteExpense, listExpenses } from "@/usecases/expense";
import { createIncoming, deleteIncoming, listIncomings } from "@/usecases/incoming";

const date = new Date("2026-10-08T23:06:12.292Z");

const category: Category = { id: "c1", name: "Lazer", createdAt: date, updatedAt: date };
const expense: Expense = {
  id: "e1",
  name: "Cinema",
  date: "2026-10-14",
  priceCents: 4500,
  categoryId: "c1",
  importHash: null,
  createdAt: date,
  updatedAt: date,
};
const incoming: Incoming = {
  id: "i1",
  origin: "Salário",
  date: "2026-10-05",
  amountCents: 500000,
  createdAt: date,
  updatedAt: date,
};
const pageMeta = { page: 1, perPage: 50, total: 1, totalPages: 1 };

function makeStore(token: string | null = "jwt"): TokenStore {
  return {
    getToken: vi.fn(() => token),
    setToken: vi.fn(),
    clearToken: vi.fn(),
  };
}

function makeCategoryRepo(): ICategoryRepository {
  return {
    list: vi.fn(async () => [category]),
    get: vi.fn(async () => category),
    create: vi.fn(async () => category),
    update: vi.fn(async () => category),
    delete: vi.fn(async () => {}),
  };
}

function makeExpenseRepo(): IExpenseRepository {
  return {
    list: vi.fn(async () => ({ items: [expense], meta: pageMeta })),
    get: vi.fn(async () => expense),
    create: vi.fn(async () => expense),
    update: vi.fn(async () => expense),
    delete: vi.fn(async () => {}),
    importCsv: vi.fn(async () => ({ created: 1, skipped: 0, duplicates: 0, errors: [] })),
  };
}

function makeIncomingRepo(): IIncomingRepository {
  return {
    list: vi.fn(async () => ({ items: [incoming], meta: pageMeta })),
    get: vi.fn(async () => incoming),
    create: vi.fn(async () => incoming),
    update: vi.fn(async () => incoming),
    delete: vi.fn(async () => {}),
  };
}

describe("category usecases", () => {
  it("lists categories with the stored token", async () => {
    const repo = makeCategoryRepo();
    const result = await listCategories(repo, makeStore(), { sort: "name" });
    expect(result).toEqual([category]);
    expect(repo.list).toHaveBeenCalledWith("jwt", { sort: "name" });
  });

  it("creates, updates and deletes using the stored token", async () => {
    const repo = makeCategoryRepo();
    const store = makeStore();
    await createCategory(repo, store, { name: "Lazer" });
    await updateCategory(repo, store, "c1", { name: "Viagens" });
    await deleteCategory(repo, store, "c1");
    expect(repo.create).toHaveBeenCalledWith("jwt", { name: "Lazer" });
    expect(repo.update).toHaveBeenCalledWith("jwt", "c1", { name: "Viagens" });
    expect(repo.delete).toHaveBeenCalledWith("jwt", "c1");
  });

  it("refuses to call the API without a token", async () => {
    const repo = makeCategoryRepo();
    await expect(listCategories(repo, makeStore(null))).rejects.toThrow("Not authenticated");
    expect(repo.list).not.toHaveBeenCalled();
  });
});

describe("expense usecases", () => {
  it("lists expenses with a period filter", async () => {
    const repo = makeExpenseRepo();
    const result = await listExpenses(repo, makeStore(), { period: "month", page: 2 });
    expect(result.items).toEqual([expense]);
    expect(result.meta).toEqual(pageMeta);
    expect(repo.list).toHaveBeenCalledWith("jwt", { period: "month", page: 2 });
  });

  it("creates and deletes using the stored token", async () => {
    const repo = makeExpenseRepo();
    const store = makeStore();
    const input = { name: "Cinema", date: "2026-10-14", priceCents: 4500, categoryId: "c1" };
    await createExpense(repo, store, input);
    await deleteExpense(repo, store, "e1");
    expect(repo.create).toHaveBeenCalledWith("jwt", input);
    expect(repo.delete).toHaveBeenCalledWith("jwt", "e1");
  });

  it("refuses to call the API without a token", async () => {
    const repo = makeExpenseRepo();
    await expect(listExpenses(repo, makeStore(null))).rejects.toThrow("Not authenticated");
    expect(repo.list).not.toHaveBeenCalled();
  });
});

describe("incoming usecases", () => {
  it("lists incomings with a period filter", async () => {
    const repo = makeIncomingRepo();
    const result = await listIncomings(repo, makeStore(), { period: "today" });
    expect(result.items).toEqual([incoming]);
    expect(repo.list).toHaveBeenCalledWith("jwt", { period: "today" });
  });

  it("creates and deletes using the stored token", async () => {
    const repo = makeIncomingRepo();
    const store = makeStore();
    const input = { origin: "Salário", date: "2026-10-05", amountCents: 500000 };
    await createIncoming(repo, store, input);
    await deleteIncoming(repo, store, "i1");
    expect(repo.create).toHaveBeenCalledWith("jwt", input);
    expect(repo.delete).toHaveBeenCalledWith("jwt", "i1");
  });

  it("refuses to call the API without a token", async () => {
    const repo = makeIncomingRepo();
    await expect(listIncomings(repo, makeStore(null))).rejects.toThrow("Not authenticated");
    expect(repo.list).not.toHaveBeenCalled();
  });
});
