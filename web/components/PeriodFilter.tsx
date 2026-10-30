"use client";

import type { Period } from "@/domain/repositories/ListOptions";

export const PERIOD_OPTIONS: { value: Period | undefined; label: string }[] = [
  { value: undefined, label: "Todas" },
  { value: "today", label: "Hoje" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "year", label: "Ano" },
];

interface PeriodFilterProps {
  value: Period | undefined;
  onChange: (value: Period | undefined) => void;
  options?: { value: Period | undefined; label: string }[];
}

export function PeriodFilter({ value, onChange, options = PERIOD_OPTIONS }: PeriodFilterProps) {
  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={
              isActive
                ? "rounded-full bg-zinc-900 px-4 py-1.5 text-sm text-white"
                : "rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100"
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
