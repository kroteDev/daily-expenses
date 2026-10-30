export interface ApiEnvelope<T> {
  data: T;
}

export interface ApiPaginatedEnvelope<T, M> extends ApiEnvelope<T> {
  meta: M;
}

export interface ApiErrorResponse {
  errors: string[];
}
