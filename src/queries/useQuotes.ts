// src/queries/useQuotes.ts
import { useQuery } from "@tanstack/react-query";
import { fetchQuotes, ApiError } from "../api/client";

export function useQuotes(symbols: string[]) {
  // Sorted so ["AAPL", "MSFT"] and ["MSFT", "AAPL"] share one cache entry
  const sorted = [...symbols].sort();

  return useQuery({
    queryKey: ["quotes", sorted],
    queryFn: () => fetchQuotes(sorted),
    enabled: sorted.length > 0,
    staleTime: 5 * 60_000,
    // Poll every 5 minutes, not every minute. Free plans don't allow more.
    refetchInterval: (query) => {
      const error = query.state.error;
      // Stop polling while rate limited, so the next call doesn't make it worse
      if (error instanceof ApiError && error.status === 429) return false;
      return 5 * 60_000;
    },
    refetchIntervalInBackground: false,
    // Never retry a rate-limited request, since a retry spends more credits
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 429) return false;
      return failureCount < 1;
    },
  });
}