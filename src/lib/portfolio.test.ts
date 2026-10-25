// src/lib/portfolio.test.ts
import { describe, it, expect } from "vitest";
import type { Holding } from "../types/market";
import {
  cagrPercent,
  periodReturnPercent,
  summarizePortfolio,
  validateHolding,
} from "./portfolio";

const aapl: Holding = { id: "1", symbol: "AAPL", quantity: 10, buyPrice: 150 };
const msft: Holding = { id: "2", symbol: "MSFT", quantity: 5, buyPrice: 300 };

describe("summarizePortfolio", () => {
  it("values positions and computes profit and loss", () => {
    const result = summarizePortfolio([aapl, msft], { AAPL: 200, MSFT: 250 });

    expect(result.totalValue).toBe(3250);
    expect(result.totalCost).toBe(3000);
    expect(result.profitLoss).toBe(250);
    expect(result.profitLossPercent).toBeCloseTo(8.33, 1);

    const [a, m] = result.positions;
    expect(a.value).toBe(2000);
    expect(a.profitLoss).toBe(500);
    expect(a.profitLossPercent).toBeCloseTo(33.33, 1);
    expect(m.profitLoss).toBe(-250);
  });

  it("allocation percentages add up to 100", () => {
    const result = summarizePortfolio([aapl, msft], { AAPL: 200, MSFT: 250 });
    const total = result.positions.reduce((s, p) => s + (p.allocationPercent ?? 0), 0);
    expect(total).toBeCloseTo(100, 5);
  });

  it("leaves unpriced holdings out of the totals and reports them", () => {
    const unknown: Holding = { id: "3", symbol: "XYZ", quantity: 5, buyPrice: 20 };
    const result = summarizePortfolio([aapl, unknown], { AAPL: 200 });

    expect(result.totalValue).toBe(2000);
    expect(result.totalCost).toBe(1500);
    expect(result.unpricedSymbols).toEqual(["XYZ"]);
    expect(result.positions[1].value).toBeNull();
    expect(result.positions[1].allocationPercent).toBeNull();
  });

  it("returns zeros and nulls for an empty portfolio", () => {
    const result = summarizePortfolio([], {});
    expect(result.totalValue).toBe(0);
    expect(result.profitLossPercent).toBeNull();
    expect(result.positions).toEqual([]);
  });
});

describe("periodReturnPercent", () => {
  it("measures change from the first close to the last", () => {
    expect(periodReturnPercent([100, 110, 90])).toBeCloseTo(-10);
  });

  it("returns null when there aren't two points", () => {
    expect(periodReturnPercent([100])).toBeNull();
    expect(periodReturnPercent([])).toBeNull();
  });
});

describe("cagrPercent", () => {
  it("returns the annual growth rate", () => {
    expect(cagrPercent(100, 121, 2)).toBeCloseTo(10, 5);
  });

  it("returns null for invalid inputs", () => {
    expect(cagrPercent(0, 100, 1)).toBeNull();
    expect(cagrPercent(100, 100, 0)).toBeNull();
  });
});

describe("validateHolding", () => {
  it("accepts a valid holding", () => {
    expect(validateHolding({ symbol: "AAPL", quantity: 1, buyPrice: 100 })).toBeNull();
  });

  it("rejects zero quantity, negative price, and bad tickers", () => {
    expect(validateHolding({ symbol: "AAPL", quantity: 0, buyPrice: 100 })).not.toBeNull();
    expect(validateHolding({ symbol: "AAPL", quantity: 1, buyPrice: -5 })).not.toBeNull();
    expect(validateHolding({ symbol: "aa pl!", quantity: 1, buyPrice: 5 })).not.toBeNull();
  });
});