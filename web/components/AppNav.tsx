"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expenses", label: "Despesas" },
  { href: "/incomings", label: "Entradas" },
  { href: "/categories", label: "Categorias" },
];

export function AppNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-8 py-4">
        <div className="flex gap-6">
          {LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? "font-semibold text-zinc-900" : "text-zinc-600 hover:text-zinc-900"}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <button
          onClick={() => signOut()}
          className="rounded-full border border-zinc-900 px-4 py-2 text-sm hover:bg-zinc-100"
        >
          Sair
        </button>
      </nav>
    </header>
  );
}
