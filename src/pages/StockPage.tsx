import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import PriceChart from "../components/charts/PriceChart";
import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import { formatMoney, formatPercent, trendArrow, trendClass } from "../lib/format";
import { periodReturnPercent } from "../lib/portfolio";
import { isValidSymbol, normalizeSymbol } from "../lib/symbols";
import { useTrackedQuotes } from "../queries/useTrackedQuotes";
import { useTimeSeries } from "../queries/useTimeSeries";

const RANGES = ["1M", "6M", "1Y"] as const;
type Range = (typeof RANGES)[number];

const RANGE_LABELS: Record<Range, string> = {
  "1M": "1 month",
  "6M": "6 months",
  "1Y": "1 year",
};

export default function StockPage() {
  const { symbol: rawSymbol = "" } = useParams();
  const symbol = normalizeSymbol(rawSymbol);
  const valid = isValidSymbol(symbol);

  const [range, setRange] = useState<Range>("1M");

  // Disabled when the symbol is invalid, so no request goes out
  const quoteQuery = useTrackedQuotes(valid ? [symbol] : []);
  const seriesQuery = useTimeSeries(valid ? symbol : "", range);

  const quote = quoteQuery.data?.find((q) => q.symbol === symbol);
  const points = seriesQuery.data?.points ?? [];
  const currency = seriesQuery.data?.currency ?? quote?.currency ?? "USD";

  const periodReturn = periodReturnPercent(points.map((p) => p.close));
  const high = points.length ? Math.max(...points.map((p) => p.close)) : null;
  const low = points.length ? Math.min(...points.map((p) => p.close)) : null;

  if (!valid) {
    return (
      <div className="space-y-4">
        <ErrorState message={`"${rawSymbol}" is not a valid ticker.`} />
        <Link to="/" className="text-sm font-medium text-indigo-600 underline underline-offset-2">
          Back to watchlist
        </Link>
      </div>
    );
  }

  function renderChart() {
    if (seriesQuery.isPending) {
      return <div className="h-72 animate-pulse rounded-xl bg-slate-200" aria-busy="true" />;
    }
    if (seriesQuery.isError) {
      return (
        <ErrorState
          message={`Couldn't load price history: ${seriesQuery.error.message}`}
          onRetry={() => seriesQuery.refetch()}
        />
      );
    }
    if (points.length === 0) {
      return <p className="py-16 text-center text-slate-600">No price history for this range.</p>;
    }
    return <PriceChart points={points} currency={currency} />;
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-block text-sm font-medium text-indigo-600 underline underline-offset-2">
        ← Back to watchlist
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{symbol}</h1>
          <p className="text-sm text-slate-500">{quote?.name ?? "Loading…"}</p>
        </div>

        {quote && (
          <div className="md:text-right">
            <p className="text-3xl font-semibold tabular-nums">
              {formatMoney(quote.price, quote.currency)}
            </p>
            <p className={`text-sm font-medium tabular-nums ${trendClass(quote.percentChange)}`}>
              <span aria-hidden="true">{trendArrow(quote.percentChange)} </span>
              {formatPercent(quote.percentChange)} today
            </p>
          </div>
        )}
      </div>

      {quoteQuery.isError && !quote && (
        <ErrorState
          message={`Couldn't load the current price: ${quoteQuery.error.message}`}
          onRetry={() => quoteQuery.refetch()}
        />
      )}

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div role="group" aria-label="Chart range" className="flex gap-2">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={range === r}
                aria-label={`Show ${RANGE_LABELS[r]}`}
                onClick={() => setRange(r)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  range === r
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {renderChart()}
      </Card>

      {points.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            label="Return over period"
            value={periodReturn === null ? "–" : formatPercent(periodReturn)}
            valueClass={trendClass(periodReturn)}
          />
          <Stat label="High" value={high === null ? "–" : formatMoney(high, currency)} />
          <Stat label="Low" value={low === null ? "–" : formatMoney(low, currency)} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}