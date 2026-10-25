// api/timeseries.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  parseSymbols,
  sendError,
  twelveGet,
  UpstreamError,
} from "../server/twelveData.js";

// Trading days per range. The client sends a range name, never raw counts.
const RANGES: Record<string, number> = {
  "1M": 22,
  "6M": 130,
  "1Y": 252,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const [symbol] = parseSymbols(req.query.symbol);
    const range = String(req.query.range ?? "1M");

    if (!Object.prototype.hasOwnProperty.call(RANGES, range)) {
      throw new UpstreamError("Unsupported range", 400);
    }

    const data = await twelveGet("/time_series", {
      symbol,
      interval: "1day",
      outputsize: String(RANGES[range]),
    });

    // Twelve Data sends newest first. Charts need oldest first.
    const points = (data.values ?? [])
      .map((v: any) => ({ date: String(v.datetime), close: Number(v.close) }))
      .filter((p: { close: number }) => Number.isFinite(p.close))
      .reverse();

    // Daily bars only change after the market closes, so cache for an hour
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
    return res.status(200).json({
      symbol,
      currency: data.meta?.currency ?? "USD",
      range,
      points,
    });
  } catch (err) {
    return sendError(res, err);
  }
}