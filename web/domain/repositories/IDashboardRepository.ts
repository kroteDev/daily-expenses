import type { DashboardSummary } from "@/domain/entities/Dashboard";
import type { Period } from "@/domain/repositories/ListOptions";

export interface IDashboardRepository {
  summary(token: string, period: Period): Promise<DashboardSummary>;
}
