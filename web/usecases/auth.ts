import type { User } from "@/domain/entities/User";
import type {
  IAuthRepository,
  SignInInput,
  SignUpInput,
} from "@/domain/repositories/IAuthRepository";
import type { TokenStore } from "@/infrastructure/auth/tokenStore";
import { ApiError } from "@/infrastructure/api/httpClient";

export function requireToken(store: TokenStore): string {
  const token = store.getToken();
  if (!token) throw new Error("Not authenticated");
  return token;
}

export async function signUpAndStore(
  repo: IAuthRepository,
  store: TokenStore,
  input: SignUpInput,
): Promise<User> {
  const session = await repo.signUp(input);
  store.setToken(session.token);
  return session.user;
}

export async function signInAndStore(
  repo: IAuthRepository,
  store: TokenStore,
  input: SignInInput,
): Promise<User> {
  const session = await repo.signIn(input);
  store.setToken(session.token);
  return session.user;
}

export async function signOutAndClear(repo: IAuthRepository, store: TokenStore): Promise<void> {
  const token = store.getToken();
  try {
    if (token) await repo.signOut(token);
  } finally {
    store.clearToken();
  }
}

export async function restoreSession(repo: IAuthRepository, store: TokenStore): Promise<User | null> {
  const token = store.getToken();
  if (!token) return null;

  try {
    return await repo.getProfile(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      store.clearToken();
      return null;
    }
    throw error;
  }
}
