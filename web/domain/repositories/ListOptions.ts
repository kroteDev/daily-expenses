export type Period = "today" | "week" | "month" | "year";

export interface ListOptions {
  sort?: string;
}

export interface PeriodListOptions extends ListOptions {
  period?: Period;
}
