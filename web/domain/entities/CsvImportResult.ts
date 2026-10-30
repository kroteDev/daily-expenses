export interface CsvImportResult {
  created: number;
  skipped: number;
  duplicates: number;
  errors: string[];
}
