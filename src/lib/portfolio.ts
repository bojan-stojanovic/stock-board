// src/lib/portfolio.ts
import type { Holding } from "../types/market";
import { isValidSymbol } from "./symbols";

export interface PositionSummary {
  id: string;
  symbol: string;
  quantity: number;
  buyPrice: number;
  price: number | null;           // null when no quote is available
  value: number | null;
  cost: number;
  profitLoss: number | null;
  profitLossPercent: number | null;
  allocationPercent: number | null;
}

export interface PortfolioSummary {
  positions: PositionSummary[];
  totalValue: number;
  totalCost: number;              // cost of the priced positions only, so P&L compares like with like
  profitLoss: number;
  profitLossPercent: number | null;
  unpricedSymbols: string[];
}

/**
 * Values each holding at the current price and compares it to what was paid.
 * Holdings without a price are listed but left out of the totals, so one
 * missing quote can't distort the profit and loss.
 */
export function summarizePortfolio(
  holdings: Holding[],
  prices: Record<string, number | undefined>,
): PortfolioSummary {
  const rows = holdings.map((h) => {
    const price = prices[h.symbol] ?? null;
    return {
      holding: h,
      price,
      cost: h.quantity * h.buyPrice,
      value: price === null ? null : h.quantity * price,
    };
  });

  const pricedRows = rows.filter((r) => r.value !== null);
  const totalValue = sum(pricedRows.map((r) => r.value as number));
  const totalCost = sum(pricedRows.map((r) => r.cost));
  const profitLoss = totalValue - totalCost;

  const positions: PositionSummary[] = rows.map(({ holding, price, cost, value }) => ({
    id: holding.id,
    symbol: holding.symbol,
    quantity: holding.quantity,
    buyPrice: holding.buyPrice,
    price,
    value,
    cost,
    profitLoss: value === null ? null : value - cost,
    profitLossPercent: value === null ? null : percentOf(value - cost, cost),
    allocationPercent: value === null ? null : percentOf(value, totalValue),
  }));

  return {
    positions,
    totalValue,
    totalCost,
    profitLoss,
    profitLossPercent: percentOf(profitLoss, totalCost),
    unpricedSymbols: rows.filter((r) => r.value === null).map((r) => r.holding.symbol),
  };
}

/** Percentage change between the first and last closing price in a range. */
export function periodReturnPercent(closes: number[]): number | null {
  if (closes.length < 2) return null;
  const first = closes[0];
  const last = closes[closes.length - 1];
  return first > 0 ? ((last - first) / first) * 100 : null;
}

/** Compound annual growth rate. Returns null when the inputs can't produce a valid result. */
export function cagrPercent(startValue: number, endValue: number, years: number): number | null {
  if (startValue <= 0 || endValue <= 0 || years <= 0) return null;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

/** Returns an error message for the form, or null when the holding is valid. */
export function validateHolding(input: {
  symbol: string;
  quantity: number;
  buyPrice: number;
}): string | null {
  if (!isValidSymbol(input.symbol)) return "Enter a valid ticker, such as AAPL";
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) return "Quantity must be greater than 0";
  if (!Number.isFinite(input.buyPrice) || input.buyPrice <= 0) return "Buy price must be greater than 0";
  return null;
}

function sum(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

function percentOf(part: number, whole: number): number | null {
  return whole > 0 ? (part / whole) * 100 : null;
}