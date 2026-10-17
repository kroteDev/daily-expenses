export interface IncomingRequestDto {
  incoming: {
    origin: string;
    date: string;
    amount_cents: number;
  };
}
