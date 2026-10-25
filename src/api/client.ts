// src/api/client.ts
import type { Quote, TimeSeriesResponse } from "../types/market";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  const params = new URLSearchParams({ symbols: symbols.join(",") });
  const data = await getJson<{ quotes: Quote[] }>(`/api/quote?${params}`);
  return data.quotes;
}

export function fetchTimeSeries(symbol: string, range: string): Promise<TimeSeriesResponse> {
  const params = new URLSearchParams({ symbol, range });
  return getJson<TimeSeriesResponse>(`/api/timeseries?${params}`);
}