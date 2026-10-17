import { describe, expect, it } from "vitest";
import { formatIsoDate, todayIso } from "@/lib/date";

describe("formatIsoDate", () => {
  it("converts yyyy-mm-dd to dd/mm/yyyy without timezone shifts", () => {
    expect(formatIsoDate("2026-10-01")).toBe("01/10/2026");
  });
});

describe("todayIso", () => {
  it("returns today as yyyy-mm-dd", () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
