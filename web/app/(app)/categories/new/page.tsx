"use client";

import { useRouter } from "next/navigation";
import { CategoryForm } from "@/components/CategoryForm";
import type { CategoryInput } from "@/domain/repositories/ICategoryRepository";
import { getCategoryRepository, getTokenStore } from "@/infrastructure/api/client";
import { createCategory } from "@/usecases/category";

export default function NewCategoryPage() {
  const router = useRouter();

  const handleSubmit = async (input: CategoryInput) => {
    await createCategory(getCategoryRepository(), getTokenStore(), input);
    router.push("/categories");
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Nova categoria</h1>
        <CategoryForm submitLabel="Salvar" onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
