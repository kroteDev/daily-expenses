import type { ApiEnvelopeRequestFn } from "@/infrastructure/api/httpClient";
import { buildQuery } from "@/infrastructure/api/httpClient";
import type { RawIncomingDto } from "@/domain/api/RawIncomingDto";
import type { RawPaginationMetaDto } from "@/domain/api/RawPaginationMetaDto";
import type { Incoming } from "@/domain/entities/Incoming";
import type { PaginatedResult } from "@/domain/entities/Pagination";
import type { PeriodListOptions } from "@/domain/repositories/ListOptions";
import type {
  IIncomingRepository,
  IncomingInput,
} from "@/domain/repositories/IIncomingRepository";
import { rawToIncoming, toRawIncoming } from "@/infrastructure/api/mappers/incomingMapper";
import { rawToPaginationMeta } from "@/infrastructure/api/mappers/paginationMapper";

export class HttpIncomingRepository implements IIncomingRepository {
  private readonly request: ApiEnvelopeRequestFn;

  constructor(request: ApiEnvelopeRequestFn) {
    this.request = request;
  }

  async list(token: string, options: PeriodListOptions = {}): Promise<PaginatedResult<Incoming>> {
    const params: Record<string, string | undefined> = {
      sort: options.sort,
      page: options.page?.toString(),
    };
    if (options.period) params[options.period] = "1";
    const { data, meta } = await this.request<RawIncomingDto[], RawPaginationMetaDto>({
      method: "GET",
      path: `/api/v1/incomings${buildQuery(params)}`,
      token,
    });
    return { items: data.map(rawToIncoming), meta: rawToPaginationMeta(meta) };
  }

  async get(token: string, id: string): Promise<Incoming> {
    const { data } = await this.request<RawIncomingDto>({
      method: "GET",
      path: `/api/v1/incomings/${id}`,
      token,
    });
    return rawToIncoming(data);
  }

  async create(token: string, input: IncomingInput): Promise<Incoming> {
    const { data } = await this.request<RawIncomingDto>({
      method: "POST",
      path: "/api/v1/incomings",
      token,
      body: toRawIncoming(input),
    });
    return rawToIncoming(data);
  }

  async update(token: string, id: string, input: IncomingInput): Promise<Incoming> {
    const { data } = await this.request<RawIncomingDto>({
      method: "PATCH",
      path: `/api/v1/incomings/${id}`,
      token,
      body: toRawIncoming(input),
    });
    return rawToIncoming(data);
  }

  async delete(token: string, id: string): Promise<void> {
    await this.request<void>({
      method: "DELETE",
      path: `/api/v1/incomings/${id}`,
      token,
    });
  }
}
