"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExpenseForm } from "@/components/ExpenseForm";
import type { Category } from "@/domain/entities/Category";
import type { Expense } from "@/domain/entities/Expense";
import type { ExpenseInput } from "@/domain/repositories/IExpenseRepository";
import { getCategoryRepository, getExpenseRepository, getTokenStore } from "@/infrastructure/api/client";
import { listCategories } from "@/usecases/category";
import { getExpense, updateExpense } from "@/usecases/expense";

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getExpense(getExpenseRepository(), getTokenStore(), id),
      listCategories(getCategoryRepository(), getTokenStore()),
    ])
      .then(([loadedExpense, loadedCategories]) => {
        setExpense(loadedExpense);
        setCategories(loadedCategories);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Falha ao carregar despesa"));
  }, [id]);

  const handleSubmit = async (input: ExpenseInput) => {
    await updateExpense(getExpenseRepository(), getTokenStore(), id, input);
    router.push("/expenses");
  };

  if (loadError) {
    return (
      <main className="min-h-screen p-8">
        <p className="text-red-600">{loadError}</p>
      </main>
    );
  }

  if (!expense || !categories) {
    return (
      <main className="min-h-screen p-8">
        <p>Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Editar despesa</h1>
        <ExpenseForm
          categories={categories}
          initial={expense}
          submitLabel="Salvar"
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
