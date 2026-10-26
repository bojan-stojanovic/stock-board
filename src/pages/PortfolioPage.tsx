import { useMemo, useState } from "react";
import AllocationChart from "../components/charts/AllocationChart";
import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import { TableSkeleton } from "../components/ui/Skeleton";
import HoldingForm from "../components/portfolio/HoldingForm";
import HoldingsTable from "../components/portfolio/HoldingsTable";
import SummaryCards from "../components/portfolio/SummaryCards";
import { summarizePortfolio } from "../lib/portfolio";
import { useTrackedQuotes } from "../queries/useTrackedQuotes";
import { usePortfolioStore } from "../stores/portfolioStore";
import type { Holding } from "../types/market";

export default function PortfolioPage() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const removeHolding = usePortfolioStore((s) => s.removeHolding);

  // null = modal closed, "new" = adding, a Holding = editing that holding
  const [formMode, setFormMode] = useState<"new" | Holding | null>(null);

  const quotesQuery = useTrackedQuotes();

  const prices = useMemo(
    () => Object.fromEntries((quotesQuery.data ?? []).map((q) => [q.symbol, q.price])),
    [quotesQuery.data],
  );
  const summary = useMemo(() => summarizePortfolio(holdings, prices), [holdings, prices]);

  const pricesLoading = holdings.length > 0 && quotesQuery.isPending;
  const pricesFailed = quotesQuery.isError && !quotesQuery.data;

  const allocationData = summary.positions
    .filter((p) => p.allocationPercent !== null)
    .map((p) => ({ name: p.symbol, value: p.allocationPercent as number }));

  const editingHolding = formMode && formMode !== "new" ? formMode : null;
  const otherSymbols = holdings
    .filter((h) => h.id !== editingHolding?.id)
    .map((h) => h.symbol);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-slate-500">
            Holdings are saved in this browser only. Prices are delayed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormMode("new")}
          className="cursor-pointer self-start rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition duration-150 hover:-translate-y-px hover:bg-slate-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:translate-y-0 active:scale-95 md:self-auto"
        >
          Add holding
        </button>
      </div>

      <Modal
        open={formMode !== null}
        title={editingHolding ? `Edit ${editingHolding.symbol}` : "New holding"}
        onClose={() => setFormMode(null)}
      >
        <HoldingForm
          key={editingHolding?.id ?? "new"}
          initial={editingHolding}
          otherSymbols={otherSymbols}
          onDone={() => setFormMode(null)}
        />
      </Modal>

      {holdings.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-slate-600">
            No holdings yet. Add a stock you own to see its value and profit or loss.
          </p>
        </Card>
      ) : (
        <>
          {pricesFailed && (
            <ErrorState
              message={`Couldn't load prices: ${quotesQuery.error.message}. Quantities and costs are still shown.`}
              onRetry={() => quotesQuery.refetch()}
            />
          )}

          <SummaryCards summary={summary} loading={pricesLoading} />

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <h2 className="mb-4 text-lg font-semibold">Holdings</h2>
              {pricesLoading ? (
                <TableSkeleton rows={holdings.length} />
              ) : (
                <HoldingsTable
                  positions={summary.positions}
                  onEdit={(id) => {
                    const holding = holdings.find((h) => h.id === id);
                    if (holding) setFormMode(holding);
                  }}
                  onRemove={removeHolding}
                />
              )}
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-semibold">Allocation</h2>
              {pricesLoading ? (
                <TableSkeleton rows={3} />
              ) : (
                <AllocationChart data={allocationData} />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}