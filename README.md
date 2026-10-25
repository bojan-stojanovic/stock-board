# Stockboard

A stock watchlist and portfolio dashboard built with React. Track quotes, see price history, and follow the value and profit or loss of holdings you enter yourself.

**Live demo:** [your-url.vercel.app]
![Dashboard screenshot](docs/dashboard.png)

> Quotes are delayed and may be incomplete. This project is for demonstration and learning. Nothing here is investment advice.

## Features

- **Watchlist** with live-refreshing quotes (every 60 seconds while the tab is visible), daily change, and per-symbol error handling
- **Stock detail** with a price chart for 1 month, 6 months, or 1 year, plus period return, high, and low
- **Portfolio** with holdings entered by the user, total value, profit and loss, and allocation by stock
- **Persistence** in the browser, with no account needed
- **Accessible** controls: keyboard navigation, focus rings, live regions for updates, and charts with text descriptions

## Architecture

```
Browser (React + Vite)
  ├─ TanStack Query  → cache, refetching, loading and error states
  ├─ Zustand         → watchlist and holdings, persisted to localStorage
  └─ Recharts        → price and allocation charts
        │  /api/quote, /api/timeseries
        ▼
Vercel serverless functions
  └─ adds the API key from the environment, validates input, sets cache headers
        │
        ▼
Twelve Data API
```

The API key never reaches the browser. The proxy validates all input before calling the upstream API, and it returns its own error messages so the upstream response is never passed through.

## Design decisions

- **Proxy with edge caching.** Quotes are cached for 60 seconds and daily price history for an hour. Many visitors share one upstream call, which keeps the free-tier rate limit usable.
- **Server response shape.** The frontend depends on our own types, not the provider's field names. Switching data providers only requires changes in `server/`.
- **Pure portfolio functions.** Profit and loss, allocation, and period return are plain TypeScript with no React imports, and they're covered by unit tests. A holding without a price is excluded from totals, so one missing quote can't distort the results.
- **TanStack Query for server data, Zustand for client data.** Server data has its own lifecycle (caching, retries, background refresh), so it stays in the query cache. Watchlist and holdings belong to the user, so they live in a small persisted store.
- **Ten-symbol limit.** The quote endpoint accepts up to ten symbols per request, so the watchlist and portfolio are limited to ten distinct tickers.

## Running locally

```bash
npm install
cp .env.example .env.local   # add your Twelve Data key
npx vercel dev               # serves the app and /api functions
```

Run the tests with `npm test`.

## Deploying

1. Push the repository to GitHub and import it into Vercel.
2. Add `TWELVE_DATA_API_KEY` under Project Settings → Environment Variables.
3. Deploy. `vercel.json` routes deep links such as `/stock/AAPL` to the app.

## Limitations

- US-listed stocks and ETFs only
- Quotes are delayed, and the free tier has request limits
- Holdings are stored in one browser and are not synced between devices
- All holdings are treated as USD, with no currency conversion
- No dividends, fees, or tax calculations

## Tech stack

React, TypeScript, Vite, TanStack Query, Zustand, React Router, Recharts, Tailwind CSS, Vitest, Vercel serverless functions

## Possible next steps

- Playwright tests for the add, edit, and remove flows
- Multi-currency support with exchange rates
- Import and export of holdings as CSV