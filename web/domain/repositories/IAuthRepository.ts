import type { User } from "@/domain/entities/User";

export interface SignUpInput {
  email: string;
  password: string;
  passwordConfirmation: string;
  name: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface IAuthRepository {
  signUp(input: SignUpInput): Promise<AuthSession>;
  signIn(input: SignInInput): Promise<AuthSession>;
  signOut(token: string): Promise<void>;
  getProfile(token: string): Promise<User>;
}
