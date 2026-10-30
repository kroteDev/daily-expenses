import { describe, expect, it } from "vitest";
import { toCategorySeries, toDateSeries } from "@/lib/dashboard";

describe("toCategorySeries", () => {
  it("sorts categories by amount, highest first", () => {
    expect(toCategorySeries({ Mercado: 1000, Lazer: 5000, Transporte: 2500 })).toEqual([
      { label: "Lazer", cents: 5000 },
      { label: "Transporte", cents: 2500 },
      { label: "Mercado", cents: 1000 },
    ]);
  });

  it("returns an empty series when there are no expenses", () => {
    expect(toCategorySeries({})).toEqual([]);
  });
});

describe("toDateSeries", () => {
  it("sorts days chronologically regardless of key order and shortens the label", () => {
    expect(toDateSeries({ "2026-10-16": 300, "2026-10-02": 100, "2026-10-09": 200 })).toEqual([
      { label: "02/10", cents: 100 },
      { label: "09/10", cents: 200 },
      { label: "16/10", cents: 300 },
    ]);
  });
});
