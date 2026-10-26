export interface Quote {
  symbol: string;
  name: string;
  currency: string;
  price: number;
  change: number;
  percentChange: number;
  previousClose: number;
  timestamp: number;
  isMarketOpen: boolean;
}

export interface PricePoint {
  date: string;
  close: number;
}

export interface TimeSeriesResponse {
  symbol: string;
  currency: string;
  range: string;
  points: PricePoint[];
}

export interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  buyPrice: number;
}