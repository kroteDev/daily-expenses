export interface RawExpenseDto {
  id: string;
  name: string;
  date: string;
  price_cents: number;
  category_id: string;
  user_id: number;
  import_hash: string | null;
  created_at: string;
  updated_at: string;
}
