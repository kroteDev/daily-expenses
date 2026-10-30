"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "@/components/AuthProvider";
import { PERIOD_OPTIONS, PeriodFilter } from "@/components/PeriodFilter";
import type { DashboardSummary } from "@/domain/entities/Dashboard";
import type { Period } from "@/domain/repositories/ListOptions";
import { formatIsoDate } from "@/lib/date";
import { toCategorySeries, toDateSeries } from "@/lib/dashboard";
import { formatCents } from "@/lib/money";
import { getDashboardRepository, getTokenStore } from "@/infrastructure/api/client";
import { getDashboard } from "@/usecases/dashboard";

const DASHBOARD_PERIOD_OPTIONS = PERIOD_OPTIONS.filter(
  (option): option is { value: Period; label: string } => option.value !== undefined,
);

const BAR_COLOR = "#18181b";

export default function DashboardPage() {
  const { signOut } = useAuth();
  const [period, setPeriod] = useState<Period>("week");
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const summary = await getDashboard(getDashboardRepository(), getTokenStore(), period);
        if (ignore) return;
        setData(summary);
        setError(null);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [period]);

  const handlePeriodChange = (value: Period | undefined) => {
    if (!value) return;
    setIsLoading(true);
    setPeriod(value);
  };

  const periodLabel = DASHBOARD_PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? period;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {data && (
            <p className="text-zinc-600">
              {formatIsoDate(data.startDate)} até {formatIsoDate(data.endDate)}
            </p>
          )}
        </div>

        <PeriodFilter value={period} onChange={handlePeriodChange} options={DASHBOARD_PERIOD_OPTIONS} />

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-center space-y-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => signOut()}
              className="rounded-full bg-zinc-900 px-6 py-2 text-white"
            >
              Sair
            </button>
          </div>
        )}

        {isLoading ? (
          <p>Carregando...</p>
        ) : (
          data && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <p className="text-sm text-zinc-600">Total de despesas</p>
                  <p className="text-2xl font-bold">{formatCents(data.totalCents)}</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <p className="text-sm text-zinc-600">Itens</p>
                  <p className="text-2xl font-bold">{data.totalItems}</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <p className="text-sm text-zinc-600">Período</p>
                  <p className="text-2xl font-bold">{periodLabel}</p>
                </div>
              </div>

              <CategoryChart series={toCategorySeries(data.byCategory)} />
              <DailyChart series={toDateSeries(data.byDate)} />
            </>
          )
        )}
      </div>
    </main>
  );
}

function CategoryChart({ series }: { series: ReturnType<typeof toCategorySeries> }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Por categoria</h2>
      {series.length === 0 ? (
        <p className="text-zinc-600">Nenhuma despesa no período.</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, series.length * 40)}>
          <BarChart data={series} layout="vertical" margin={{ left: 8, right: 24 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="label" width={140} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => formatCents(Number(value))} />
            <Bar dataKey="cents" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function DailyChart({ series }: { series: ReturnType<typeof toDateSeries> }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Por dia</h2>
      {series.length === 0 ? (
        <p className="text-zinc-600">Nenhuma despesa no período.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={series}>
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip formatter={(value) => formatCents(Number(value))} />
            <Bar dataKey="cents" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
