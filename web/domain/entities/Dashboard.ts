import type { Period } from "@/domain/repositories/ListOptions";

export interface DashboardSummary {
  filter: Period;
  startDate: string;
  endDate: string;
  totalItems: number;
  totalCents: number;
  byCategory: Record<string, number>;
  byDate: Record<string, number>;
}
