import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_WATCHLIST,
  MAX_WATCHLIST,
  isValidSymbol,
  normalizeSymbol,
} from "../lib/symbols";

interface WatchlistState {
  symbols: string[];
  /** Returns an error message, or null when the symbol was added. */
  addSymbol: (raw: string) => string | null;
  removeSymbol: (symbol: string) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: DEFAULT_WATCHLIST,

      addSymbol: (raw) => {
        const symbol = normalizeSymbol(raw);
        const { symbols } = get();

        if (!isValidSymbol(symbol)) return "Enter a valid ticker, such as AAPL";
        if (symbols.includes(symbol)) return `${symbol} is already in your watchlist`;
        if (symbols.length >= MAX_WATCHLIST) return `Watchlist is limited to ${MAX_WATCHLIST} symbols`;

        set({ symbols: [...symbols, symbol] });
        return null;
      },

      removeSymbol: (symbol) =>
        set((state) => ({ symbols: state.symbols.filter((s) => s !== symbol) })),
    }),
    { name: "stockboard-watchlist" },
  ),
);