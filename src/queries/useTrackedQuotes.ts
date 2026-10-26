import { useMemo } from "react";
import { useWatchlistStore } from "../stores/watchlistStore";
import { usePortfolioStore } from "../stores/portfolioStore";
import { useQuotes } from "./useQuotes";

/**
 * Quotes for everything the user tracks (watchlist and holdings) plus any
 * extra symbol, such as the one on the stock page. Every page uses the same
 * sorted key, so Twelve Data is called once per refresh, not once per page.
 */
export function useTrackedQuotes(extra: string[] = []) {
  const watchlist = useWatchlistStore((s) => s.symbols);
  const holdings = usePortfolioStore((s) => s.holdings);
  const extraKey = extra.join(",");

  const symbols = useMemo(() => {
    const all = new Set([
      ...watchlist,
      ...holdings.map((h) => h.symbol),
      ...extraKey.split(",").filter(Boolean),
    ]);
    return [...all].sort();
  }, [watchlist, holdings, extraKey]);

  return useQuotes(symbols);
}