export interface SignUpRequestDto {
  user: {
    email: string;
    password: string;
    password_confirmation: string;
    name: string;
  };
}

export interface SignInRequestDto {
  user: {
    email: string;
    password: string;
  };
}
