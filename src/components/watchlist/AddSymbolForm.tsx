// src/components/watchlist/AddSymbolForm.tsx
import { useState, type FormEvent } from "react";
import { useWatchlistStore } from "../../stores/watchlistStore";

export default function AddSymbolForm() {
  const addSymbol = useWatchlistStore((s) => s.addSymbol);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = addSymbol(value);
    setError(message);
    if (!message) setValue("");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-1">
      <div className="flex gap-2">
        <label htmlFor="add-symbol" className="sr-only">
          Ticker symbol
        </label>
        <input
          id="add-symbol"
          value={value}
          maxLength={10}
          autoComplete="off"
          placeholder="Add ticker, e.g. AMD"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "add-symbol-error" : undefined}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          className="w-44 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition duration-150 hover:-translate-y-px hover:bg-slate-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:translate-y-0 active:scale-95"
        >
          Add
        </button>
      </div>
      {error && (
        <p id="add-symbol-error" role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}