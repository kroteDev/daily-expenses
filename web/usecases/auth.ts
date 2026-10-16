import type { User } from "@/domain/entities/User";
import type {
  IAuthRepository,
  SignInInput,
  SignUpInput,
} from "@/domain/repositories/IAuthRepository";
import type { TokenStore } from "@/infrastructure/auth/tokenStore";

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
