import type { SignInRequestDto, SignUpRequestDto } from "@/domain/api/AuthRequests";
import type { RawUserDto } from "@/domain/api/RawUserDto";
import type { SignInInput, SignUpInput } from "@/domain/repositories/IAuthRepository";
import type { User } from "@/domain/entities/User";

export function rawToUser(raw: RawUserDto): User {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
  };
}

export function toRawSignUp(input: SignUpInput): SignUpRequestDto {
  return {
    user: {
      email: input.email,
      password: input.password,
      password_confirmation: input.passwordConfirmation,
      name: input.name,
    },
  };
}

export function toRawSignIn(input: SignInInput): SignInRequestDto {
  return {
    user: {
      email: input.email,
      password: input.password,
    },
  };
}
