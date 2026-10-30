export type Period = "today" | "week" | "month" | "year";

export interface ListOptions {
  sort?: string;
  page?: number;
}

export interface PeriodListOptions extends ListOptions {
  period?: Period;
}
