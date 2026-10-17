import type { ApiRequestFn } from "@/infrastructure/api/httpClient";
import { buildQuery } from "@/infrastructure/api/httpClient";
import type { RawIncomingDto } from "@/domain/api/RawIncomingDto";
import type { Incoming } from "@/domain/entities/Incoming";
import type { PeriodListOptions } from "@/domain/repositories/ListOptions";
import type {
  IIncomingRepository,
  IncomingInput,
} from "@/domain/repositories/IIncomingRepository";
import { rawToIncoming, toRawIncoming } from "@/infrastructure/api/mappers/incomingMapper";

export class HttpIncomingRepository implements IIncomingRepository {
  private readonly request: ApiRequestFn;

  constructor(request: ApiRequestFn) {
    this.request = request;
  }

  async list(token: string, options: PeriodListOptions = {}): Promise<Incoming[]> {
    const params: Record<string, string | undefined> = { sort: options.sort };
    if (options.period) params[options.period] = "1";
    const raw = await this.request<RawIncomingDto[]>({
      method: "GET",
      path: `/api/v1/incomings${buildQuery(params)}`,
      token,
    });
    return raw.map(rawToIncoming);
  }

  async get(token: string, id: string): Promise<Incoming> {
    const raw = await this.request<RawIncomingDto>({
      method: "GET",
      path: `/api/v1/incomings/${id}`,
      token,
    });
    return rawToIncoming(raw);
  }

  async create(token: string, input: IncomingInput): Promise<Incoming> {
    const raw = await this.request<RawIncomingDto>({
      method: "POST",
      path: "/api/v1/incomings",
      token,
      body: toRawIncoming(input),
    });
    return rawToIncoming(raw);
  }

  async update(token: string, id: string, input: IncomingInput): Promise<Incoming> {
    const raw = await this.request<RawIncomingDto>({
      method: "PATCH",
      path: `/api/v1/incomings/${id}`,
      token,
      body: toRawIncoming(input),
    });
    return rawToIncoming(raw);
  }

  async delete(token: string, id: string): Promise<void> {
    await this.request<void>({
      method: "DELETE",
      path: `/api/v1/incomings/${id}`,
      token,
    });
  }
}
