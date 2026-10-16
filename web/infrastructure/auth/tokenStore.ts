export interface TokenStore {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
}

const TOKEN_KEY = "daily_expenses.jwt";

function storage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return window.localStorage;
}

export const localStorageTokenStore: TokenStore = {
  getToken: () => storage()?.getItem(TOKEN_KEY) ?? null,
  setToken: (token: string) => storage()?.setItem(TOKEN_KEY, token),
  clearToken: () => storage()?.removeItem(TOKEN_KEY),
};
