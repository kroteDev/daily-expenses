export interface RawDashboardDto {
  filter: string;
  start_date: string;
  end_date: string;
  total_items: number;
  total_cents: number;
  by_category: Record<string, number>;
  by_date: Record<string, number>;
}
