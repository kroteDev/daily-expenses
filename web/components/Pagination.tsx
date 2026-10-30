import type { PaginationMeta } from "@/domain/entities/Pagination";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ meta, onPageChange, disabled = false }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  const isFirstPage = meta.page <= 1;
  const isLastPage = meta.page >= meta.totalPages;

  return (
    <nav className="flex items-center justify-between text-sm">
      <button
        type="button"
        onClick={() => onPageChange(meta.page - 1)}
        disabled={disabled || isFirstPage}
        className="rounded-full border border-zinc-900 px-4 py-2 hover:bg-zinc-100 disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-zinc-600">
        Página {meta.page} de {meta.totalPages} · {meta.total} itens
      </span>
      <button
        type="button"
        onClick={() => onPageChange(meta.page + 1)}
        disabled={disabled || isLastPage}
        className="rounded-full border border-zinc-900 px-4 py-2 hover:bg-zinc-100 disabled:opacity-50"
      >
        Próxima
      </button>
    </nav>
  );
}
