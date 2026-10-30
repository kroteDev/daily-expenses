import type { ApiRequestFn } from "@/infrastructure/api/httpClient";
import { buildQuery } from "@/infrastructure/api/httpClient";
import type { RawDashboardDto } from "@/domain/api/RawDashboardDto";
import type { DashboardSummary } from "@/domain/entities/Dashboard";
import type { Period } from "@/domain/repositories/ListOptions";
import type { IDashboardRepository } from "@/domain/repositories/IDashboardRepository";
import { rawToDashboardSummary } from "@/infrastructure/api/mappers/dashboardMapper";

export class HttpDashboardRepository implements IDashboardRepository {
  private readonly request: ApiRequestFn;

  constructor(request: ApiRequestFn) {
    this.request = request;
  }

  async summary(token: string, period: Period): Promise<DashboardSummary> {
    const raw = await this.request<RawDashboardDto>({
      method: "GET",
      path: `/api/v1/dashboard${buildQuery({ filter: period })}`,
      token,
    });
    return rawToDashboardSummary(raw);
  }
}
