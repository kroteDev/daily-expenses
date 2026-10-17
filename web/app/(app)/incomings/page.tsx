"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PeriodFilter } from "@/components/PeriodFilter";
import type { Incoming } from "@/domain/entities/Incoming";
import type { Period } from "@/domain/repositories/ListOptions";
import { formatCents } from "@/lib/money";
import { formatIsoDate } from "@/lib/date";
import { getIncomingRepository, getTokenStore } from "@/infrastructure/api/client";
import { deleteIncoming, listIncomings } from "@/usecases/incoming";

export default function IncomingsPage() {
  const [period, setPeriod] = useState<Period | undefined>(undefined);
  const [incomings, setIncomings] = useState<Incoming[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const result = await listIncomings(getIncomingRepository(), getTokenStore(), { period });
        if (ignore) return;
        setIncomings(result);
        setError(null);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Falha ao carregar entradas");
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

  const handleDelete = async (incoming: Incoming) => {
    if (!window.confirm(`Excluir a entrada "${incoming.origin}"?`)) return;
    try {
      await deleteIncoming(getIncomingRepository(), getTokenStore(), incoming.id);
      setIsLoading(true);
      setReloadCount((count) => count + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir entrada");
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Entradas</h1>
          <Link
            href="/incomings/new"
            className="rounded-full bg-zinc-900 px-6 py-2 text-white hover:bg-zinc-800"
          >
            Nova entrada
          </Link>
        </div>

        <PeriodFilter value={period} onChange={handlePeriodChange} />

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="rounded-xl bg-white p-6 shadow-sm">
          {isLoading ? (
            <p>Carregando...</p>
          ) : incomings.length === 0 ? (
            <p className="text-zinc-600">Nenhuma entrada no período.</p>
          ) : (
            <ul className="divide-y divide-zinc-200">
              {incomings.map((incoming) => (
                <li key={incoming.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{incoming.origin}</p>
                    <p className="text-sm text-zinc-600">{formatIsoDate(incoming.date)}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="font-medium">{formatCents(incoming.amountCents)}</span>
                    <Link
                      href={`/incomings/${incoming.id}/edit`}
                      className="text-zinc-900 underline"
                    >
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(incoming)} className="text-red-600 underline">
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
