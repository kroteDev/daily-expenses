export interface ExpenseRequestDto {
  expense: {
    name: string;
    date: string;
    price_cents: number;
    category_id: string;
  };
}
