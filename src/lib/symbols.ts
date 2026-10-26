export const DEFAULT_WATCHLIST = ["AAPL", "MSFT", "NVDA", "SPY"];
export const MAX_WATCHLIST = 10;

const SYMBOL_PATTERN = /^[A-Z.]{1,10}$/;

export function normalizeSymbol(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isValidSymbol(symbol: string): boolean {
  return SYMBOL_PATTERN.test(symbol);
}