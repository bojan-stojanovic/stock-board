// api/quote.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  parseSymbols,
  sendError,
  toQuoteList,
  twelveGet,
} from "../server/twelveData";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const symbols = parseSymbols(req.query.symbols);

    // One request covers the whole watchlist
    const data = await twelveGet("/quote", { symbol: symbols.join(",") });
    const quotes = toQuoteList(data, symbols);

    // Quotes change during the day, so cache briefly at the edge
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    return res.status(200).json({ quotes });
  } catch (err) {
    return sendError(res, err);
  }
}