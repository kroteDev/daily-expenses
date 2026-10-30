import { describe, expect, it } from "vitest";
import type { RawDashboardDto } from "@/domain/api/RawDashboardDto";
import { rawToDashboardSummary } from "@/infrastructure/api/mappers/dashboardMapper";

describe("rawToDashboardSummary", () => {
  it("maps snake_case dashboard fields to camelCase", () => {
    const raw: RawDashboardDto = {
      filter: "month",
      start_date: "2026-10-01",
      end_date: "2026-10-31",
      total_items: 3,
      total_cents: 4500,
      by_category: { Lazer: 4500 },
      by_date: { "2026-10-14": 4500 },
    };

    expect(rawToDashboardSummary(raw)).toEqual({
      filter: "month",
      startDate: "2026-10-01",
      endDate: "2026-10-31",
      totalItems: 3,
      totalCents: 4500,
      byCategory: { Lazer: 4500 },
      byDate: { "2026-10-14": 4500 },
    });
  });
});
