import type { DashboardSummary } from "@/domain/entities/Dashboard";
import type { IDashboardRepository } from "@/domain/repositories/IDashboardRepository";
import type { Period } from "@/domain/repositories/ListOptions";
import type { TokenStore } from "@/infrastructure/auth/tokenStore";
import { requireToken } from "@/usecases/auth";

export async function getDashboard(
  repo: IDashboardRepository,
  store: TokenStore,
  period: Period,
): Promise<DashboardSummary> {
  return repo.summary(requireToken(store), period);
}
