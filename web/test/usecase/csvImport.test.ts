import { describe, expect, it, vi } from "vitest";
import type { IExpenseRepository } from "@/domain/repositories/IExpenseRepository";
import type { TokenStore } from "@/infrastructure/auth/tokenStore";
import { importExpensesCsv } from "@/usecases/expense";

const result = { created: 2, skipped: 1, duplicates: 0, errors: [] };

function makeStore(token: string | null = "jwt"): TokenStore {
  return {
    getToken: vi.fn(() => token),
    setToken: vi.fn(),
    clearToken: vi.fn(),
  };
}

function makeRepo(): IExpenseRepository {
  return {
    list: vi.fn(async () => ({ items: [], meta: { page: 1, perPage: 50, total: 0, totalPages: 0 } })),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    importCsv: vi.fn(async () => result),
  };
}

describe("importExpensesCsv", () => {
  it("uploads the file with the stored token and returns the summary", async () => {
    const repo = makeRepo();
    const file = new File(["Data de Compra;Descrição"], "fatura.csv", { type: "text/csv" });

    const summary = await importExpensesCsv(repo, makeStore("jwt"), file);

    expect(repo.importCsv).toHaveBeenCalledWith("jwt", file);
    expect(summary).toEqual(result);
  });

  it("requires a session before uploading", async () => {
    const repo = makeRepo();
    const file = new File([""], "fatura.csv", { type: "text/csv" });

    await expect(importExpensesCsv(repo, makeStore(null), file)).rejects.toThrow();
    expect(repo.importCsv).not.toHaveBeenCalled();
  });
});
