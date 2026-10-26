import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "../../lib/format";
import type { PricePoint } from "../../types/market";

interface Props {
  points: PricePoint[];
  currency: string;
}

// Appending a time avoids the date shifting by a day when parsed as UTC
const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function PriceChart({ points, currency }: Props) {
  // Caller guarantees at least one point
  const first = points[0].close;
  const last = points[points.length - 1].close;
  const stroke = last >= first ? "#059669" : "#dc2626";

  return (
    <div
      className="h-72"
      role="img"
      aria-label={`Price chart from ${formatMoney(first, currency)} to ${formatMoney(last, currency)}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tick={{ fontSize: 12, fill: "#64748b" }}
            minTickGap={24}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => v.toFixed(2)}
            tick={{ fontSize: 12, fill: "#64748b" }}
            width={64}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            labelFormatter={(label) => shortDate(String(label))}
            formatter={(value) => [formatMoney(Number(value), currency), "Close"]}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke={stroke}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}