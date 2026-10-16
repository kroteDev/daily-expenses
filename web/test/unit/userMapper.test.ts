import { describe, expect, it } from "vitest";
import type { RawUserDto } from "@/domain/api/RawUserDto";
import { rawToUser, toRawSignIn, toRawSignUp } from "@/infrastructure/api/mappers/userMapper";

const raw: RawUserDto = {
  id: 1,
  email: "maria@example.com",
  name: "Maria",
  created_at: "2026-10-08T23:06:12.292Z",
  updated_at: "2026-10-08T23:06:12.292Z",
};

describe("rawToUser", () => {
  it("maps snake_case to camelCase and parses dates", () => {
    expect(rawToUser(raw)).toEqual({
      id: 1,
      email: "maria@example.com",
      name: "Maria",
      createdAt: new Date("2026-10-08T23:06:12.292Z"),
      updatedAt: new Date("2026-10-08T23:06:12.292Z"),
    });
  });

  it("produces real Date instances", () => {
    const user = rawToUser(raw);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });
});

describe("toRawSignUp", () => {
  it("builds the exact wire payload", () => {
    expect(
      toRawSignUp({
        email: "maria@example.com",
        password: "SenhaSegura123",
        passwordConfirmation: "SenhaSegura123",
        name: "Maria",
      }),
    ).toEqual({
      user: {
        email: "maria@example.com",
        password: "SenhaSegura123",
        password_confirmation: "SenhaSegura123",
        name: "Maria",
      },
    });
  });
});

describe("toRawSignIn", () => {
  it("builds the exact wire payload", () => {
    expect(
      toRawSignIn({
        email: "maria@example.com",
        password: "SenhaSegura123",
      }),
    ).toEqual({
      user: {
        email: "maria@example.com",
        password: "SenhaSegura123",
      },
    });
  });
});
