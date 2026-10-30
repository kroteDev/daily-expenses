import type { ApiErrorResponse } from "@/domain/api/ApiEnvelope";

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

export function createApiClient({ baseUrl }: { baseUrl: string }): ApiRequestFn {
  return async function apiRequest<T>({ method, path, token, body, onResponse }: ApiRequestOptions) {
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

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    const json = text ? (JSON.parse(text) as unknown) : null;

    if (!res.ok) {
      const messages =
        (json as ApiErrorResponse | null)?.errors ?? [`Request failed with status ${res.status}`];
      throw new ApiError(res.status, messages);
    }

    return (json as { data: T }).data;
  };
}

export function createBrowserApiClient(): ApiRequestFn {
  return createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  });
}

export function createServerApiClient(): ApiRequestFn {
  return createApiClient({
    baseUrl: process.env.API_INTERNAL_BASE_URL ?? "http://api:3000",
  });
}
