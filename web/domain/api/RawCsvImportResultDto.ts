export interface RawCsvImportResultDto {
  created: number;
  skipped: number;
  duplicates: number;
  errors: string[];
}
