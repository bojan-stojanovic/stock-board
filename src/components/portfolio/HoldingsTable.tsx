// src/components/portfolio/HoldingsTable.tsx
import type { PositionSummary } from "../../lib/portfolio";
import { formatMoney, formatPercent, trendArrow, trendClass } from "../../lib/format";

interface Props {
  positions: PositionSummary[];
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}

const numberFormat = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 4 });

export default function HoldingsTable({ positions, onEdit, onRemove }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="py-2 pr-4 font-medium">Symbol</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Qty</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Avg buy</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Price</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Value</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">P&amp;L</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Share</th>
            <th scope="col" className="py-2 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {positions.map((p) => (
            <tr key={p.id} className="transition hover:bg-slate-50">
              <td className="py-3 pr-4 font-semibold">{p.symbol}</td>
              <td className="py-3 pr-4 text-right tabular-nums">{numberFormat(p.quantity)}</td>
              <td className="py-3 pr-4 text-right tabular-nums">{formatMoney(p.buyPrice)}</td>
              <td className="py-3 pr-4 text-right tabular-nums">
                {p.price === null ? "–" : formatMoney(p.price)}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums">
                {p.value === null ? "–" : formatMoney(p.value)}
              </td>
              <td className={`py-3 pr-4 text-right tabular-nums ${trendClass(p.profitLossPercent)}`}>
                {p.profitLoss === null ? (
                  "–"
                ) : (
                  <>
                    <span className="block font-medium">{formatMoney(p.profitLoss)}</span>
                    <span className="block text-xs">
                      <span aria-hidden="true">{trendArrow(p.profitLossPercent)} </span>
                      {formatPercent(p.profitLossPercent)}
                    </span>
                  </>
                )}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums">
                {p.allocationPercent === null ? "–" : `${p.allocationPercent.toFixed(1)}%`}
              </td>
              <td className="py-3 text-right">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    aria-label={`Edit ${p.symbol} holding`}
                    onClick={() => onEdit(p.id)}
                    className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${p.symbol} holding`}
                    onClick={() => onRemove(p.id)}
                    className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}