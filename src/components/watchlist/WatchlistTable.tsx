// src/components/watchlist/WatchlistTable.tsx
import type { Quote } from "../../types/market";
import { formatMoney, formatPercent, trendArrow, trendClass } from "../../lib/format";
import { Link } from "react-router-dom";

export interface WatchlistRow {
    symbol: string;
    quote?: Quote;   // undefined when the API had no data for this symbol
}

interface Props {
    rows: WatchlistRow[];
    onRemove: (symbol: string) => void;
}

export default function WatchlistTable({ rows, onRemove }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                        <th scope="col" className="py-2 pr-4 font-medium">Symbol</th>
                        <th scope="col" className="py-2 pr-4 font-medium">Name</th>
                        <th scope="col" className="py-2 pr-4 text-right font-medium">Price</th>
                        <th scope="col" className="py-2 pr-4 text-right font-medium">Change</th>
                        <th scope="col" className="py-2 text-right font-medium">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {rows.map(({ symbol, quote }) => (
                        <tr key={symbol} className="transition hover:bg-slate-50">
                            <td className="py-3 pr-4 font-semibold">
                                <Link
                                    to={`/stock/${symbol}`}
                                    className="rounded text-indigo-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    {symbol}
                                </Link>
                            </td>

                            {quote ? (
                                <>
                                    <td className="max-w-[16rem] truncate py-3 pr-4 text-slate-600">{quote.name}</td>
                                    <td className="py-3 pr-4 text-right font-medium tabular-nums">
                                        {formatMoney(quote.price, quote.currency)}
                                    </td>
                                    <td className={`py-3 pr-4 text-right font-medium tabular-nums ${trendClass(quote.percentChange)}`}>
                                        <span aria-hidden="true">{trendArrow(quote.percentChange)} </span>
                                        {formatPercent(quote.percentChange)}
                                    </td>
                                </>
                            ) : (
                                <td colSpan={3} className="py-3 pr-4 text-slate-400">
                                    Quote unavailable. Check the ticker or remove it.
                                </td>
                            )}

                            <td className="py-3 text-right">
                                <button
                                    type="button"
                                    aria-label={`Remove ${symbol} from watchlist`}
                                    onClick={() => onRemove(symbol)}
                                    className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}