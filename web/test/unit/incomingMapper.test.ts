import { describe, expect, it } from "vitest";
import type { RawIncomingDto } from "@/domain/api/RawIncomingDto";
import { rawToIncoming, toRawIncoming } from "@/infrastructure/api/mappers/incomingMapper";

const raw: RawIncomingDto = {
  id: "3a4b5c6d-0000-4000-8000-000000000003",
  origin: "Salário",
  date: "2026-10-05",
  amount_cents: 500000,
  user_id: 1,
  created_at: "2026-10-05T08:00:00.000Z",
  updated_at: "2026-10-05T08:00:00.000Z",
};

describe("rawToIncoming", () => {
  it("maps snake_case to camelCase and keeps the date as yyyy-mm-dd", () => {
    expect(rawToIncoming(raw)).toEqual({
      id: "3a4b5c6d-0000-4000-8000-000000000003",
      origin: "Salário",
      date: "2026-10-05",
      amountCents: 500000,
      createdAt: new Date("2026-10-05T08:00:00.000Z"),
      updatedAt: new Date("2026-10-05T08:00:00.000Z"),
    });
  });
});

describe("toRawIncoming", () => {
  it("builds the exact wire payload", () => {
    expect(
      toRawIncoming({
        origin: "Salário",
        date: "2026-10-05",
        amountCents: 500000,
      }),
    ).toEqual({
      incoming: {
        origin: "Salário",
        date: "2026-10-05",
        amount_cents: 500000,
      },
    });
  });
});
