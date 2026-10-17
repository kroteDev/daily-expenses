import { createBrowserApiClient, type ApiRequestFn } from "./httpClient";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { HttpAuthRepository } from "@/infrastructure/api/repositories/HttpAuthRepository";
import { localStorageTokenStore, type TokenStore } from "@/infrastructure/auth/tokenStore";

let browserClient: ApiRequestFn | null = null;
let tokenStore: TokenStore = localStorageTokenStore;

export function getBrowserClient(): ApiRequestFn {
  if (!browserClient) browserClient = createBrowserApiClient();
  return browserClient;
}

export function getTokenStore(): TokenStore {
  return tokenStore;
}

export function setTokenStore(store: TokenStore): void {
  tokenStore = store;
}

export function currentToken(): string | null {
  return getTokenStore().getToken();
}

export function getAuthRepository(): IAuthRepository {
  return new HttpAuthRepository(getBrowserClient());
}
