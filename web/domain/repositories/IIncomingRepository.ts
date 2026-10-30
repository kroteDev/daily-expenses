import type { Incoming } from "@/domain/entities/Incoming";
import type { PaginatedResult } from "@/domain/entities/Pagination";
import type { PeriodListOptions } from "@/domain/repositories/ListOptions";

export interface IncomingInput {
  origin: string;
  date: string;
  amountCents: number;
}

export interface IIncomingRepository {
  list(token: string, options?: PeriodListOptions): Promise<PaginatedResult<Incoming>>;
  get(token: string, id: string): Promise<Incoming>;
  create(token: string, input: IncomingInput): Promise<Incoming>;
  update(token: string, id: string, input: IncomingInput): Promise<Incoming>;
  delete(token: string, id: string): Promise<void>;
}
