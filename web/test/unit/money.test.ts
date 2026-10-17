import { describe, expect, it } from "vitest";
import { centsToInput, formatCents, parseReaisToCents } from "@/lib/money";

describe("formatCents", () => {
  it("formats cents as BRL with two decimals", () => {
    expect(formatCents(12345)).toBe("R$ 123.45");
    expect(formatCents(5)).toBe("R$ 0.05");
  });
});

describe("centsToInput", () => {
  it("formats cents with a decimal comma for the input", () => {
    expect(centsToInput(12345)).toBe("123,45");
    expect(centsToInput(500)).toBe("5,00");
  });
});

describe("parseReaisToCents", () => {
  it.each([
    ["12,34", 1234],
    ["1.234,56", 123456],
    ["R$ 10,5", 1050],
    ["7", 700],
    ["0,99", 99],
    ["12.50", 1250],
  ])("parses %s into %i cents", (input, cents) => {
    expect(parseReaisToCents(input)).toBe(cents);
  });

  it.each(["", "abc", "1,2,3", "-5", "1,999"])("rejects %s", (input) => {
    expect(parseReaisToCents(input)).toBeNull();
  });
});
