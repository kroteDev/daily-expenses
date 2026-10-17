import type { IncomingRequestDto } from "@/domain/api/IncomingRequests";
import type { RawIncomingDto } from "@/domain/api/RawIncomingDto";
import type { Incoming } from "@/domain/entities/Incoming";
import type { IncomingInput } from "@/domain/repositories/IIncomingRepository";

export function rawToIncoming(raw: RawIncomingDto): Incoming {
  return {
    id: raw.id,
    origin: raw.origin,
    date: raw.date,
    amountCents: raw.amount_cents,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
  };
}

export function toRawIncoming(input: IncomingInput): IncomingRequestDto {
  return {
    incoming: {
      origin: input.origin,
      date: input.date,
      amount_cents: input.amountCents,
    },
  };
}
