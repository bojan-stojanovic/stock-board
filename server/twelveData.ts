import type { VercelRequest, VercelResponse } from "@vercel/node";

const BASE_URL = "https://api.twelvedata.com";
const SYMBOL_PATTERN = /^[A-Z.]{1,10}$/;
export const MAX_SYMBOLS = 10;

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

export class UpstreamError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Validates a comma-separated symbol list from the query string.
 * Throws UpstreamError (400) if the list is empty, too long, or has bad characters.
 */
export function parseSymbols(raw: unknown): string[] {
  const symbols = [
    ...new Set(
      String(raw ?? "")
        .toUpperCase()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];

  if (symbols.length === 0 || symbols.length > MAX_SYMBOLS) {
    throw new UpstreamError(`Provide 1 to ${MAX_SYMBOLS} symbols`, 400);
  }
  if (!symbols.every((s) => SYMBOL_PATTERN.test(s))) {
    throw new UpstreamError("Invalid symbol", 400);
  }
  return symbols;
}

/** GET request to Twelve Data. The key is added here and never placed in error messages. */
export async function twelveGet(path: string, params: Record<string, string>) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) throw new UpstreamError("Server misconfigured", 500);

  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries({ ...params, apikey: apiKey })) {
    url.searchParams.set(key, value);
  }

  // Log the request without the key
  const safeUrl = new URL(url);
  safeUrl.searchParams.delete("apikey");

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    console.error("Twelve Data network error", safeUrl.toString(), err);
    throw new UpstreamError("Market data unavailable", 502);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || data?.status === "error") {
    console.error(
      "Twelve Data error",
      safeUrl.toString(),
      res.status,
      data?.code,
      data?.message,
    );

    if (res.status === 429 || data?.code === 429) {
      throw new UpstreamError("Rate limit reached, try again in a minute", 429);
    }
    throw new UpstreamError("Market data unavailable", 502);
  }

  return data;
}

function toQuote(raw: any): Quote | null {
  const price = Number(raw?.close);
  if (!Number.isFinite(price)) return null;

  return {
    symbol: String(raw.symbol),
    name: String(raw.name ?? raw.symbol),
    currency: String(raw.currency ?? "USD"),
    price,
    change: Number(raw.change),
    percentChange: Number(raw.percent_change),
    previousClose: Number(raw.previous_close),
    timestamp: Number(raw.timestamp),
    isMarketOpen: Boolean(raw.is_market_open),
  };
}

/**
 * Twelve Data returns a single object for one symbol and an object keyed by symbol for many.
 * This normalizes both into a list and drops symbols that failed on their own.
 */
export function toQuoteList(data: any, symbols: string[]): Quote[] {
  const items = symbols.length === 1 ? [data] : symbols.map((s) => data?.[s]);
  return items.map(toQuote).filter((q): q is Quote => q !== null);
}

/** Sends an error as JSON with the status set by UpstreamError, or 500 for anything unexpected. */
export function sendError(res: VercelResponse, err: unknown) {
  if (err instanceof UpstreamError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error("Unexpected proxy error", err);
  return res.status(500).json({ error: "Unexpected server error" });
}

export type { VercelRequest, VercelResponse };