import { describe, expect, it } from "vitest";
import { validatePassword } from "@/lib/password";

describe("validatePassword", () => {
  it("accepts letters, a number and a special character", () => {
    expect(validatePassword("abc123#")).toEqual([]);
  });

  it("accepts accented letters as letters", () => {
    expect(validatePassword("Açúcar2026_")).toEqual([]);
  });

  it("rejects a password shorter than 6 characters", () => {
    expect(validatePassword("ab1!")).toContain("A senha deve ter pelo menos 6 caracteres.");
  });

  it("rejects a password without a letter", () => {
    expect(validatePassword("123456!")).toEqual(["A senha deve conter pelo menos uma letra."]);
  });

  it("rejects a password without a number", () => {
    expect(validatePassword("abcdef!")).toEqual(["A senha deve conter pelo menos um número."]);
  });

  it("rejects a password without a special character", () => {
    expect(validatePassword("abcdef1")).toEqual(["A senha deve conter pelo menos um caractere especial."]);
  });

  it("does not count spaces as special characters", () => {
    expect(validatePassword("abcdef 1")).toEqual(["A senha deve conter pelo menos um caractere especial."]);
  });

  it("reports every missing rule at once", () => {
    expect(validatePassword("")).toHaveLength(4);
  });
});
