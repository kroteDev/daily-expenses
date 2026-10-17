"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryForm } from "@/components/CategoryForm";
import type { Category } from "@/domain/entities/Category";
import type { CategoryInput } from "@/domain/repositories/ICategoryRepository";
import { getCategoryRepository, getTokenStore } from "@/infrastructure/api/client";
import { getCategory, updateCategory } from "@/usecases/category";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getCategory(getCategoryRepository(), getTokenStore(), id)
      .then(setCategory)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Falha ao carregar categoria"));
  }, [id]);

  const handleSubmit = async (input: CategoryInput) => {
    await updateCategory(getCategoryRepository(), getTokenStore(), id, input);
    router.push("/categories");
  };

  if (loadError) {
    return (
      <main className="min-h-screen p-8">
        <p className="text-red-600">{loadError}</p>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="min-h-screen p-8">
        <p>Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Editar categoria</h1>
        <CategoryForm
          initialName={category.name}
          submitLabel="Salvar"
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
