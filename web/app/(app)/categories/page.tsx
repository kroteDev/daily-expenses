"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category } from "@/domain/entities/Category";
import { getCategoryRepository, getTokenStore } from "@/infrastructure/api/client";
import { deleteCategory, listCategories } from "@/usecases/category";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const result = await listCategories(getCategoryRepository(), getTokenStore(), { sort: "name" });
        if (ignore) return;
        setCategories(result);
        setError(null);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Falha ao carregar categorias");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [reloadCount]);

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return;
    try {
      await deleteCategory(getCategoryRepository(), getTokenStore(), category.id);
      setIsLoading(true);
      setReloadCount((count) => count + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir categoria");
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Categorias</h1>
          <Link
            href="/categories/new"
            className="rounded-full bg-zinc-900 px-6 py-2 text-white hover:bg-zinc-800"
          >
            Nova categoria
          </Link>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="rounded-xl bg-white p-6 shadow-sm">
          {isLoading ? (
            <p>Carregando...</p>
          ) : categories.length === 0 ? (
            <p className="text-zinc-600">Nenhuma categoria cadastrada.</p>
          ) : (
            <ul className="divide-y divide-zinc-200">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center justify-between py-3">
                  <span className="font-medium">{category.name}</span>
                  <div className="flex gap-4 text-sm">
                    <Link
                      href={`/categories/${category.id}/edit`}
                      className="text-zinc-900 underline"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(category)}
                      className="text-red-600 underline"
                    >
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
