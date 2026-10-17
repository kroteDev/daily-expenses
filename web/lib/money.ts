export function formatCents(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2)}`;
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function parseReaisToCents(value: string): number | null {
  const normalized = value.replace(/R\$/i, "").replace(/\s/g, "");
  const numeric = normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : normalized;
  if (!/^\d+(\.\d{1,2})?$/.test(numeric)) return null;
  return Math.round(Number(numeric) * 100);
}
