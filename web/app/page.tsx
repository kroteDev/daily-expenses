"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">Daily Expenses</h1>
        <p className="text-lg text-zinc-600">
          Uma forma prática e rápida de registrar todas as suas despesas diárias.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signin"
            className="rounded-full bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-800 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-zinc-900 px-6 py-3 hover:bg-zinc-100 transition-colors"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </main>
  );
}
