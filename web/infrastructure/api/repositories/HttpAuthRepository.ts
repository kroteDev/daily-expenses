import type { ApiRequestFn } from "@/infrastructure/api/httpClient";
import { extractBearerToken } from "@/infrastructure/api/httpClient";
import type { RawUserDto } from "@/domain/api/RawUserDto";
import type {
  AuthSession,
  IAuthRepository,
  SignInInput,
  SignUpInput,
} from "@/domain/repositories/IAuthRepository";
import { rawToUser, toRawSignIn, toRawSignUp } from "@/infrastructure/api/mappers/userMapper";

export class HttpAuthRepository implements IAuthRepository {
  private readonly request: ApiRequestFn;

  constructor(request: ApiRequestFn) {
    this.request = request;
  }

  async signUp(input: SignUpInput): Promise<AuthSession> {
    let token: string | null = null;
    const raw = await this.request<RawUserDto>({
      method: "POST",
      path: "/api/v1/signup",
      body: toRawSignUp(input),
      onResponse: (res) => {
        token = extractBearerToken(res.headers.get("authorization"));
      },
    });
    if (!token) throw new Error("Missing Authorization header in signup response");
    return { user: rawToUser(raw), token };
  }

  async signIn(input: SignInInput): Promise<AuthSession> {
    let token: string | null = null;
    const raw = await this.request<RawUserDto>({
      method: "POST",
      path: "/api/v1/signin",
      body: toRawSignIn(input),
      onResponse: (res) => {
        token = extractBearerToken(res.headers.get("authorization"));
      },
    });
    if (!token) throw new Error("Missing Authorization header in signin response");
    return { user: rawToUser(raw), token };
  }

  async signOut(token: string): Promise<void> {
    await this.request<unknown>({
      method: "DELETE",
      path: "/api/v1/signout",
      token,
    });
  }
}
