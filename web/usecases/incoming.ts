import type { Incoming } from "@/domain/entities/Incoming";
import type {
  IIncomingRepository,
  IncomingInput,
} from "@/domain/repositories/IIncomingRepository";
import type { PeriodListOptions } from "@/domain/repositories/ListOptions";
import type { TokenStore } from "@/infrastructure/auth/tokenStore";
import { requireToken } from "@/usecases/auth";

export async function listIncomings(
  repo: IIncomingRepository,
  store: TokenStore,
  options?: PeriodListOptions,
): Promise<Incoming[]> {
  return repo.list(requireToken(store), options);
}

export async function getIncoming(repo: IIncomingRepository, store: TokenStore, id: string): Promise<Incoming> {
  return repo.get(requireToken(store), id);
}

export async function createIncoming(
  repo: IIncomingRepository,
  store: TokenStore,
  input: IncomingInput,
): Promise<Incoming> {
  return repo.create(requireToken(store), input);
}

export async function updateIncoming(
  repo: IIncomingRepository,
  store: TokenStore,
  id: string,
  input: IncomingInput,
): Promise<Incoming> {
  return repo.update(requireToken(store), id, input);
}

export async function deleteIncoming(repo: IIncomingRepository, store: TokenStore, id: string): Promise<void> {
  return repo.delete(requireToken(store), id);
}
