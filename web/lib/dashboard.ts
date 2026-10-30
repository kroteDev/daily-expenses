export interface ChartPoint {
  label: string;
  cents: number;
}

export function toCategorySeries(byCategory: Record<string, number>): ChartPoint[] {
  return Object.entries(byCategory)
    .map(([label, cents]) => ({ label, cents }))
    .sort((a, b) => b.cents - a.cents);
}

export function toDateSeries(byDate: Record<string, number>): ChartPoint[] {
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([iso, cents]) => ({ label: shortDate(iso), cents }));
}

function shortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}
