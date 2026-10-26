import AddSymbolForm from "../components/watchlist/AddSymbolForm";
import WatchlistTable, { type WatchlistRow } from "../components/watchlist/WatchlistTable";
import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import { TableSkeleton } from "../components/ui/Skeleton";
import { useTrackedQuotes } from "../queries/useTrackedQuotes";
import { useWatchlistStore } from "../stores/watchlistStore";

export default function DashboardPage() {
  const symbols = useWatchlistStore((s) => s.symbols);
  const removeSymbol = useWatchlistStore((s) => s.removeSymbol);
  const query = useTrackedQuotes();

  const quotes = query.data ?? [];
  const rows: WatchlistRow[] = symbols.map((symbol) => ({
    symbol,
    quote: quotes.find((q) => q.symbol === symbol),
  }));

  const updatedAt = query.dataUpdatedAt
    ? new Date(query.dataUpdatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;
  const marketOpen = quotes.some((q) => q.isMarketOpen);

  function renderBody() {
    if (symbols.length === 0) {
      return (
        <p className="py-8 text-center text-slate-600">
          Your watchlist is empty. Add a ticker above.
        </p>
      );
    }

    // First load: nothing to show yet
    if (query.isPending) {
      return <TableSkeleton rows={symbols.length} />;
    }

    // Failed with no data at all: show the error and a retry button
    if (query.isError && !query.data) {
      return (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      );
    }

    return (
      <>
        {query.isError && (
          <div className="mb-3">
            <ErrorState
              message={`Couldn't refresh quotes: ${query.error.message}. Showing the last update.`}
            />
          </div>
        )}
        <WatchlistTable rows={rows} onRemove={removeSymbol} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Watchlist</h1>
          <p className="text-sm text-slate-500">Delayed quotes for US stocks and ETFs.</p>
        </div>
        <AddSymbolForm />
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <p aria-live="polite">
            {updatedAt
              ? `Updated ${updatedAt}${marketOpen ? "" : " · Market closed"}`
              : "Loading quotes…"}
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
            disabled={query.isFetching || symbols.length === 0}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {query.isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {renderBody()}
      </Card>
    </div>
  );
}