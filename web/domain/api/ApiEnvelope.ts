export interface ApiEnvelope<T> {
  data: T;
}

export interface ApiErrorResponse {
  errors: string[];
}
