export interface Mag7Entry {
  readonly ticker: string;
  readonly ytd: number;
  readonly price: number | null;
}

export interface Mag7Response {
  readonly data: Mag7Entry[];
  readonly year: number;
}
