"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category } from "@/domain/entities/Category";
import type { Expense } from "@/domain/entities/Expense";
import type { ExpenseInput } from "@/domain/repositories/IExpenseRepository";
import { centsToInput, parseReaisToCents } from "@/lib/money";
import { todayIso } from "@/lib/date";

const DEFAULT_CATEGORY_NAME = "Sem categoria";

interface ExpenseFormProps {
  categories: Category[];
  initial?: Expense;
  submitLabel: string;
  onSubmit: (input: ExpenseInput) => Promise<void>;
}

export function ExpenseForm({ categories, initial, submitLabel, onSubmit }: ExpenseFormProps) {
  const defaultCategoryId =
    categories.find((category) => category.name === DEFAULT_CATEGORY_NAME)?.id ??
    categories[0]?.id ??
    "";

  const [name, setName] = useState(initial?.name ?? "");
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [price, setPrice] = useState(initial ? centsToInput(initial.priceCents) : "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? defaultCategoryId);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceCents = parseReaisToCents(price);
    if (priceCents === null) {
      setError("Informe um valor válido, por exemplo 25,90");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name, date, priceCents, categoryId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar despesa");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Nome
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-900 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium">
          Data
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-900 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium">
          Valor (R$)
        </label>
        <input
          id="price"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-900 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium">
          Categoria
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 focus:border-zinc-900 focus:outline-none"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting || categoryId === ""}
          className="rounded-full bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Salvando..." : submitLabel}
        </button>
        <Link href="/expenses" className="text-sm text-zinc-600 hover:text-zinc-900">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
