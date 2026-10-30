import { describe, expect, it, vi } from "vitest";
import type { DashboardSummary } from "@/domain/entities/Dashboard";
import type { IDashboardRepository } from "@/domain/repositories/IDashboardRepository";
import type { TokenStore } from "@/infrastructure/auth/tokenStore";
import { getDashboard } from "@/usecases/dashboard";

const summary: DashboardSummary = {
  filter: "week",
  startDate: "2026-10-26",
  endDate: "2026-11-01",
  totalItems: 0,
  totalCents: 0,
  byCategory: {},
  byDate: {},
};

function makeStore(token: string | null = "jwt"): TokenStore {
  return {
    getToken: vi.fn(() => token),
    setToken: vi.fn(),
    clearToken: vi.fn(),
  };
}

describe("getDashboard", () => {
  it("requests the summary for the period with the stored token", async () => {
    const repo: IDashboardRepository = { summary: vi.fn(async () => summary) };

    const result = await getDashboard(repo, makeStore("jwt"), "week");

    expect(repo.summary).toHaveBeenCalledWith("jwt", "week");
    expect(result).toEqual(summary);
  });

  it("refuses to call the API without a token", async () => {
    const repo: IDashboardRepository = { summary: vi.fn(async () => summary) };

    await expect(getDashboard(repo, makeStore(null), "week")).rejects.toThrow("Not authenticated");
    expect(repo.summary).not.toHaveBeenCalled();
  });
});
