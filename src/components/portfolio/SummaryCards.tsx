// src/components/portfolio/SummaryCards.tsx
import { formatMoney, formatPercent, trendArrow, trendClass } from "../../lib/format";
import type { PortfolioSummary } from "../../lib/portfolio";

interface Props {
  summary: PortfolioSummary;
  loading: boolean;
}

function Stat({ label, value, sub, valueClass = "" }: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${valueClass}`}>{value}</p>
      {sub && <p className={`mt-1 text-sm tabular-nums ${valueClass}`}>{sub}</p>}
    </div>
  );
}

export default function SummaryCards({ summary, loading }: Props) {
  const pending = loading ? "…" : null;

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Total value"
          value={pending ?? formatMoney(summary.totalValue)}
        />
        <Stat
          label="Profit / loss"
          value={pending ?? formatMoney(summary.profitLoss)}
          sub={
            pending ?? `${trendArrow(summary.profitLossPercent)} ${formatPercent(summary.profitLossPercent)}`
          }
          valueClass={loading ? "" : trendClass(summary.profitLoss)}
        />
        <Stat
          label="Cost basis"
          value={pending ?? formatMoney(summary.totalCost)}
        />
      </div>

      {!loading && summary.unpricedSymbols.length > 0 && (
        <p className="text-sm text-amber-700" role="status">
          No price for {summary.unpricedSymbols.join(", ")}. These holdings are excluded from the totals.
        </p>
      )}
    </div>
  );
}