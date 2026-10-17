"use client";

import { useState } from "react";
import Link from "next/link";
import type { CategoryInput } from "@/domain/repositories/ICategoryRepository";

interface CategoryFormProps {
  initialName?: string;
  submitLabel: string;
  onSubmit: (input: CategoryInput) => Promise<void>;
}

export function CategoryForm({ initialName = "", submitLabel, onSubmit }: CategoryFormProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({ name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar categoria");
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

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Salvando..." : submitLabel}
        </button>
        <Link href="/categories" className="text-sm text-zinc-600 hover:text-zinc-900">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
