import { describe, expect, it } from "vitest";
import type { RawCsvImportResultDto } from "@/domain/api/RawCsvImportResultDto";
import { rawToCsvImportResult } from "@/infrastructure/api/mappers/csvImportMapper";

describe("rawToCsvImportResult", () => {
  it("keeps the import counters and error messages", () => {
    const raw: RawCsvImportResultDto = {
      created: 86,
      skipped: 4,
      duplicates: 1,
      errors: ["Invalid date: 31/13/2026"],
    };

    expect(rawToCsvImportResult(raw)).toEqual({
      created: 86,
      skipped: 4,
      duplicates: 1,
      errors: ["Invalid date: 31/13/2026"],
    });
  });
});
