import type { RawDashboardDto } from "@/domain/api/RawDashboardDto";
import type { DashboardSummary } from "@/domain/entities/Dashboard";
import type { Period } from "@/domain/repositories/ListOptions";

export function rawToDashboardSummary(raw: RawDashboardDto): DashboardSummary {
  return {
    filter: raw.filter as Period,
    startDate: raw.start_date,
    endDate: raw.end_date,
    totalItems: raw.total_items,
    totalCents: raw.total_cents,
    byCategory: raw.by_category,
    byDate: raw.by_date,
  };
}
