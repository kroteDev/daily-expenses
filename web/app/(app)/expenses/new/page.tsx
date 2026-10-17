"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExpenseForm } from "@/components/ExpenseForm";
import type { Category } from "@/domain/entities/Category";
import type { ExpenseInput } from "@/domain/repositories/IExpenseRepository";
import { getCategoryRepository, getExpenseRepository, getTokenStore } from "@/infrastructure/api/client";
import { listCategories } from "@/usecases/category";
import { createExpense } from "@/usecases/expense";

export default function NewExpensePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    listCategories(getCategoryRepository(), getTokenStore())
      .then(setCategories)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Falha ao carregar categorias"));
  }, []);

  const handleSubmit = async (input: ExpenseInput) => {
    await createExpense(getExpenseRepository(), getTokenStore(), input);
    router.push("/expenses");
  };

  if (loadError) {
    return (
      <main className="min-h-screen p-8">
        <p className="text-red-600">{loadError}</p>
      </main>
    );
  }

  if (!categories) {
    return (
      <main className="min-h-screen p-8">
        <p>Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Nova despesa</h1>
        <ExpenseForm categories={categories} submitLabel="Salvar" onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
