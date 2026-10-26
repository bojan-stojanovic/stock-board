import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Holding } from "../types/market";

type NewHolding = Omit<Holding, "id">;

interface PortfolioState {
  holdings: Holding[];
  addHolding: (input: NewHolding) => void;
  updateHolding: (id: string, input: NewHolding) => void;
  removeHolding: (id: string) => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      holdings: [],

      addHolding: (input) =>
        set((state) => ({
          holdings: [
            ...state.holdings,
            { ...input, symbol: input.symbol.toUpperCase(), id: crypto.randomUUID() },
          ],
        })),

      updateHolding: (id, input) =>
        set((state) => ({
          holdings: state.holdings.map((h) =>
            h.id === id ? { ...input, symbol: input.symbol.toUpperCase(), id } : h,
          ),
        })),

      removeHolding: (id) =>
        set((state) => ({ holdings: state.holdings.filter((h) => h.id !== id) })),
    }),
    { name: "stockboard-portfolio" },
  ),
);