// src/lib/format.ts
export function formatMoney(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export function formatPercent(value: number | null): string {
  if (value === null) return "–";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function trendClass(value: number | null): string {
  if (value === null || value === 0) return "text-slate-600";
  return value > 0 ? "text-emerald-700" : "text-red-700";
}

export function trendArrow(value: number | null): string {
  if (value === null || value === 0) return "";
  return value > 0 ? "▲" : "▼";
}