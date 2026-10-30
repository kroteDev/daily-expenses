"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { CsvImportResult } from "@/domain/entities/CsvImportResult";
import { getExpenseRepository, getTokenStore } from "@/infrastructure/api/client";
import { importExpensesCsv } from "@/usecases/expense";

export default function ImportExpensesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setError(null);
    setResult(null);
    setIsSubmitting(true);
    try {
      const summary = await importExpensesCsv(getExpenseRepository(), getTokenStore(), file);
      setResult(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao importar CSV");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Importar fatura</h1>
          <p className="text-sm text-zinc-600">
            Envie o CSV exportado da fatura do cartão. Linhas duplicadas e estornos são ignorados.
          </p>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="file" className="block text-sm font-medium">
              Arquivo CSV
            </label>
            <input
              id="file"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="mt-1 block w-full text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={!file || isSubmitting}
            className="rounded-full bg-zinc-900 px-6 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {isSubmitting ? "Importando..." : "Importar"}
          </button>
        </form>

        {result && (
          <div className="rounded-xl bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">Resultado</h2>
            <dl className="grid grid-cols-3 gap-4 text-center">
              <div>
                <dt className="text-sm text-zinc-600">Criadas</dt>
                <dd className="text-2xl font-bold">{result.created}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-600">Ignoradas</dt>
                <dd className="text-2xl font-bold">{result.skipped}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-600">Duplicadas</dt>
                <dd className="text-2xl font-bold">{result.duplicates}</dd>
              </div>
            </dl>

            {result.errors.length > 0 && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <p className="font-medium">Erros:</p>
                <ul className="list-disc pl-5">
                  {result.errors.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            <Link href="/expenses" className="text-zinc-900 underline">
              Ver despesas
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
