"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getBrowserClient } from "@/infrastructure/api/client";

interface DashboardData {
  filter: string;
  start_date: string;
  end_date: string;
  total_items: number;
  total_cents: number;
  by_category: Record<string, number>;
  by_date: Record<string, number>;
}

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/signin");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const client = getBrowserClient();
        const result = await client<DashboardData>({
          method: "GET",
          path: "/api/v1/dashboard",
        });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => signOut()}
            className="rounded-full bg-zinc-900 px-6 py-2 text-white"
          >
            Sair
          </button>
        </div>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-zinc-600">
              {data.start_date} até {data.end_date}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded-full border border-zinc-900 px-4 py-2 hover:bg-zinc-100"
          >
            Sair
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-600">Total de despesas</p>
            <p className="text-2xl font-bold">
              R$ {(data.total_cents / 100).toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-600">Itens</p>
            <p className="text-2xl font-bold">{data.total_items}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-600">Período</p>
            <p className="text-2xl font-bold capitalize">{data.filter}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Por categoria</h2>
          {Object.entries(data.by_category).length === 0 ? (
            <p className="text-zinc-600">Nenhuma despesa no período.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(data.by_category).map(([category, cents]) => (
                <li key={category} className="flex justify-between">
                  <span>{category}</span>
                  <span className="font-medium">
                    R$ {(cents / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
