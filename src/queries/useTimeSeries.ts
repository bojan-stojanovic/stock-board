import { useQuery } from "@tanstack/react-query";
import { fetchTimeSeries } from "../api/client";

export function useTimeSeries(symbol: string, range: "1M" | "6M" | "1Y") {
  return useQuery({
    queryKey: ["timeseries", symbol, range],
    queryFn: () => fetchTimeSeries(symbol, range),
    enabled: Boolean(symbol),
    staleTime: 60 * 60 * 1000, // daily bars only change after the market closes
  });
}