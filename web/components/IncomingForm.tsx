"use client";

import { useState } from "react";
import Link from "next/link";
import type { Incoming } from "@/domain/entities/Incoming";
import type { IncomingInput } from "@/domain/repositories/IIncomingRepository";
import { centsToInput, parseReaisToCents } from "@/lib/money";
import { todayIso } from "@/lib/date";

interface IncomingFormProps {
  initial?: Incoming;
  submitLabel: string;
  onSubmit: (input: IncomingInput) => Promise<void>;
}

export function IncomingForm({ initial, submitLabel, onSubmit }: IncomingFormProps) {
  const [origin, setOrigin] = useState(initial?.origin ?? "");
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [amount, setAmount] = useState(initial ? centsToInput(initial.amountCents) : "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountCents = parseReaisToCents(amount);
    if (amountCents === null) {
      setError("Informe um valor válido, por exemplo 1.500,00");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ origin, date, amountCents });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar entrada");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label htmlFor="origin" className="block text-sm font-medium">
          Origem
        </label>
        <input
          id="origin"
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
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
        <label htmlFor="amount" className="block text-sm font-medium">
          Valor (R$)
        </label>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
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
        <Link href="/incomings" className="text-sm text-zinc-600 hover:text-zinc-900">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
