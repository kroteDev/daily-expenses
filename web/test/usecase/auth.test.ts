import { describe, expect, it, vi } from "vitest";
import type { User } from "@/domain/entities/User";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import type { TokenStore } from "@/infrastructure/auth/tokenStore";
import { signInAndStore, signOutAndClear, signUpAndStore } from "@/usecases/auth";

const user: User = {
  id: 1,
  email: "maria@example.com",
  name: "Maria",
  createdAt: new Date("2026-10-08T23:06:12.292Z"),
  updatedAt: new Date("2026-10-08T23:06:12.292Z"),
};

function makeRepo(overrides: Partial<IAuthRepository> = {}): IAuthRepository {
  return {
    signUp: vi.fn(async () => ({ user, token: "jwt" })),
    signIn: vi.fn(async () => ({ user, token: "jwt" })),
    signOut: vi.fn(async () => {}),
    ...overrides,
  };
}

function makeStore(): TokenStore {
  return {
    getToken: vi.fn(() => "jwt"),
    setToken: vi.fn(),
    clearToken: vi.fn(),
  };
}

describe("signUpAndStore", () => {
  it("stores the token and returns the user", async () => {
    const repo = makeRepo();
    const store = makeStore();
    const result = await signUpAndStore(repo, store, {
      email: "maria@example.com",
      password: "SenhaSegura123",
      passwordConfirmation: "SenhaSegura123",
      name: "Maria",
    });
    expect(result).toEqual(user);
    expect(store.setToken).toHaveBeenCalledWith("jwt");
  });
});

describe("signInAndStore", () => {
  it("stores the token and returns the user", async () => {
    const repo = makeRepo();
    const store = makeStore();
    const result = await signInAndStore(repo, store, {
      email: "maria@example.com",
      password: "SenhaSegura123",
    });
    expect(result).toEqual(user);
    expect(store.setToken).toHaveBeenCalledWith("jwt");
  });
});

describe("signOutAndClear", () => {
  it("calls signOut with the stored token and clears it", async () => {
    const repo = makeRepo();
    const store = makeStore();
    await signOutAndClear(repo, store);
    expect(repo.signOut).toHaveBeenCalledWith("jwt");
    expect(store.clearToken).toHaveBeenCalled();
  });

  it("still clears the token if signOut fails", async () => {
    const repo = makeRepo({ signOut: vi.fn(async () => { throw new Error("network"); }) });
    const store = makeStore();
    await expect(signOutAndClear(repo, store)).rejects.toThrow("network");
    expect(store.clearToken).toHaveBeenCalled();
  });
});
