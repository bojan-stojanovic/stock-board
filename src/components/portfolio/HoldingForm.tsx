import { useState, type SubmitEvent } from "react";
import { validateHolding } from "../../lib/portfolio";
import { MAX_WATCHLIST, normalizeSymbol } from "../../lib/symbols";
import { usePortfolioStore } from "../../stores/portfolioStore";
import type { Holding } from "../../types/market";

interface Props {
  /** The holding being edited, or null when adding */
  initial: Holding | null;
  /** Symbols of the other holdings, so the limit check ignores the one being edited */
  otherSymbols: string[];
  onDone: () => void;
}

export default function HoldingForm({ initial, otherSymbols, onDone }: Props) {
  const addHolding = usePortfolioStore((s) => s.addHolding);
  const updateHolding = usePortfolioStore((s) => s.updateHolding);

  const [symbol, setSymbol] = useState(initial?.symbol ?? "");
  const [quantity, setQuantity] = useState(initial ? String(initial.quantity) : "");
  const [buyPrice, setBuyPrice] = useState(initial ? String(initial.buyPrice) : "");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const input = {
      symbol: normalizeSymbol(symbol),
      quantity: Number(quantity),
      buyPrice: Number(buyPrice),
    };

    const message = validateHolding(input);
    if (message) {
      setError(message);
      return;
    }

    // The quote endpoint accepts at most 10 symbols per request,
    // so the portfolio can't hold more distinct stocks than that
    const distinct = new Set([...otherSymbols, input.symbol]);
    if (distinct.size > MAX_WATCHLIST) {
      setError(`A portfolio can hold up to ${MAX_WATCHLIST} different stocks`);
      return;
    }

    if (initial) updateHolding(initial.id, input);
    else addHolding(input);
    onDone();
  }

  const errorId = "holding-form-error";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="holding-symbol" className="text-sm font-medium text-slate-700">
          Ticker
        </label>
        <input
          id="holding-symbol"
          value={symbol}
          maxLength={10}
          autoComplete="off"
          placeholder="AAPL"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => {
            setSymbol(e.target.value);
            setError(null);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="holding-quantity" className="text-sm font-medium text-slate-700">
          Quantity
        </label>
        <input
          id="holding-quantity"
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={quantity}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => {
            setQuantity(e.target.value);
            setError(null);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="holding-buy-price" className="text-sm font-medium text-slate-700">
          Average buy price (USD)
        </label>
        <input
          id="holding-buy-price"
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={buyPrice}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => {
            setBuyPrice(e.target.value);
            setError(null);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        />
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-700 sm:col-span-3">
          {error}
        </p>
      )}

      <div className="flex gap-2 sm:col-span-3">
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition duration-150 hover:-translate-y-px hover:bg-slate-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:translate-y-0 active:scale-95"
        >
          {initial ? "Save changes" : "Add holding"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}