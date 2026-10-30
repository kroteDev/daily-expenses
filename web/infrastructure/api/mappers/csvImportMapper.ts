import type { RawCsvImportResultDto } from "@/domain/api/RawCsvImportResultDto";
import type { CsvImportResult } from "@/domain/entities/CsvImportResult";

export function rawToCsvImportResult(raw: RawCsvImportResultDto): CsvImportResult {
  return {
    created: raw.created,
    skipped: raw.skipped,
    duplicates: raw.duplicates,
    errors: raw.errors,
  };
}
