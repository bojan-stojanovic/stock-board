// src/queries/useQuotes.ts
import { useQuery } from "@tanstack/react-query";
import { fetchQuotes } from "../api/client";

export function useQuotes(symbols: string[]) {
  // Sorted so ["AAPL", "MSFT"] and ["MSFT", "AAPL"] share one cache entry
  const sorted = [...symbols].sort();

  return useQuery({
    queryKey: ["quotes", sorted],
    queryFn: () => fetchQuotes(sorted),
    enabled: sorted.length > 0,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false, // stop polling while the tab is hidden
  });
}