"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PeriodFilter } from "@/components/PeriodFilter";
import type { Category } from "@/domain/entities/Category";
import type { Expense } from "@/domain/entities/Expense";
import type { Period } from "@/domain/repositories/ListOptions";
import { formatCents } from "@/lib/money";
import { formatIsoDate } from "@/lib/date";
import { getCategoryRepository, getExpenseRepository, getTokenStore } from "@/infrastructure/api/client";
import { listCategories } from "@/usecases/category";
import { deleteExpense, listExpenses } from "@/usecases/expense";

export default function ExpensesPage() {
  const [period, setPeriod] = useState<Period | undefined>(undefined);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const [expenseList, categories] = await Promise.all([
          listExpenses(getExpenseRepository(), getTokenStore(), { period }),
          listCategories(getCategoryRepository(), getTokenStore()),
        ]);
        if (ignore) return;
        setExpenses(expenseList);
        setCategoryNames(toNameMap(categories));
        setError(null);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Falha ao carregar despesas");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [period, reloadCount]);

  const handlePeriodChange = (value: Period | undefined) => {
    setIsLoading(true);
    setPeriod(value);
  };

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Excluir a despesa "${expense.name}"?`)) return;
    try {
      await deleteExpense(getExpenseRepository(), getTokenStore(), expense.id);
      setIsLoading(true);
      setReloadCount((count) => count + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir despesa");
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Despesas</h1>
          <Link
            href="/expenses/new"
            className="rounded-full bg-zinc-900 px-6 py-2 text-white hover:bg-zinc-800"
          >
            Nova despesa
          </Link>
        </div>

        <PeriodFilter value={period} onChange={handlePeriodChange} />

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="rounded-xl bg-white p-6 shadow-sm">
          {isLoading ? (
            <p>Carregando...</p>
          ) : expenses.length === 0 ? (
            <p className="text-zinc-600">Nenhuma despesa no período.</p>
          ) : (
            <ul className="divide-y divide-zinc-200">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{expense.name}</p>
                    <p className="text-sm text-zinc-600">
                      {formatIsoDate(expense.date)} · {categoryNames[expense.categoryId] ?? "Sem categoria"}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="font-medium">{formatCents(expense.priceCents)}</span>
                    <Link
                      href={`/expenses/${expense.id}/edit`}
                      className="text-zinc-900 underline"
                    >
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(expense)} className="text-red-600 underline">
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}

function toNameMap(categories: Category[]): Record<string, string> {
  return Object.fromEntries(categories.map((category) => [category.id, category.name]));
}
