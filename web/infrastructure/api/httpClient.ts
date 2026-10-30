import type { ApiEnvelope, ApiErrorResponse, ApiPaginatedEnvelope } from "@/domain/api/ApiEnvelope";

export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages.join("; ") || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.messages = messages;
  }
}

export interface ApiRequestOptions {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  token?: string;
  body?: unknown | FormData;
  onResponse?: (res: Response) => void;
}

export type ApiRequestFn = <T>(options: ApiRequestOptions) => Promise<T>;

export type ApiEnvelopeRequestFn = <T, M = unknown>(options: ApiRequestOptions) => Promise<ApiPaginatedEnvelope<T, M>>;

export type TokenProvider = () => string | null;

export function extractBearerToken(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const token = headerValue.replace(/^Bearer\s+/i, "");
  return token === "" ? null : token;
}

export function buildQuery(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string] => entry[1] !== undefined,
  );
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : "";
}

function createRequester(baseUrl: string) {
  return async function send({ method, path, token, body, onResponse }: ApiRequestOptions): Promise<unknown> {
    const isFormData = body instanceof FormData;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (!isFormData) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
    onResponse?.(res);

    if (res.status === 204) return undefined;

    const text = await res.text();
    const json = text ? (JSON.parse(text) as unknown) : null;

    if (!res.ok) {
      const messages =
        (json as ApiErrorResponse | null)?.errors ?? [`Request failed with status ${res.status}`];
      throw new ApiError(res.status, messages);
    }

    return json;
  };
}

export function createApiClient({ baseUrl }: { baseUrl: string }): ApiRequestFn {
  const send = createRequester(baseUrl);
  return async function apiRequest<T>(options: ApiRequestOptions) {
    const json = (await send(options)) as ApiEnvelope<T> | undefined;
    return json?.data as T;
  };
}

export function createEnvelopeApiClient({ baseUrl }: { baseUrl: string }): ApiEnvelopeRequestFn {
  const send = createRequester(baseUrl);
  return async function apiEnvelopeRequest<T, M = unknown>(options: ApiRequestOptions) {
    return (await send(options)) as ApiPaginatedEnvelope<T, M>;
  };
}

export function createBrowserApiClient(): ApiRequestFn {
  return createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  });
}

export function createBrowserEnvelopeApiClient(): ApiEnvelopeRequestFn {
  return createEnvelopeApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  });
}

export function createServerApiClient(): ApiRequestFn {
  return createApiClient({
    baseUrl: process.env.API_INTERNAL_BASE_URL ?? "http://api:3000",
  });
}
