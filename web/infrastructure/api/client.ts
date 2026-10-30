import {
  createBrowserApiClient,
  createBrowserEnvelopeApiClient,
  type ApiEnvelopeRequestFn,
  type ApiRequestFn,
} from "./httpClient";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import type { ICategoryRepository } from "@/domain/repositories/ICategoryRepository";
import type { IDashboardRepository } from "@/domain/repositories/IDashboardRepository";
import type { IExpenseRepository } from "@/domain/repositories/IExpenseRepository";
import type { IIncomingRepository } from "@/domain/repositories/IIncomingRepository";
import { HttpAuthRepository } from "@/infrastructure/api/repositories/HttpAuthRepository";
import { HttpDashboardRepository } from "@/infrastructure/api/repositories/HttpDashboardRepository";
import { HttpCategoryRepository } from "@/infrastructure/api/repositories/HttpCategoryRepository";
import { HttpExpenseRepository } from "@/infrastructure/api/repositories/HttpExpenseRepository";
import { HttpIncomingRepository } from "@/infrastructure/api/repositories/HttpIncomingRepository";
import { localStorageTokenStore, type TokenStore } from "@/infrastructure/auth/tokenStore";

let browserClient: ApiRequestFn | null = null;
let browserEnvelopeClient: ApiEnvelopeRequestFn | null = null;
let tokenStore: TokenStore = localStorageTokenStore;

export function getBrowserClient(): ApiRequestFn {
  if (!browserClient) browserClient = createBrowserApiClient();
  return browserClient;
}

export function getBrowserEnvelopeClient(): ApiEnvelopeRequestFn {
  if (!browserEnvelopeClient) browserEnvelopeClient = createBrowserEnvelopeApiClient();
  return browserEnvelopeClient;
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

export function getCategoryRepository(): ICategoryRepository {
  return new HttpCategoryRepository(getBrowserClient());
}

export function getDashboardRepository(): IDashboardRepository {
  return new HttpDashboardRepository(getBrowserClient());
}

export function getExpenseRepository(): IExpenseRepository {
  return new HttpExpenseRepository(getBrowserEnvelopeClient());
}

export function getIncomingRepository(): IIncomingRepository {
  return new HttpIncomingRepository(getBrowserEnvelopeClient());
}
