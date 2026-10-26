import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#14b8a6", "#f97316", "#ec4899", "#64748b",
];

interface Slice {
  name: string;
  value: number;
}

export default function AllocationChart({ data }: { data: Slice[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Allocation appears once prices load.</p>;
  }

  // Screen readers get the same numbers as text, since the chart itself is visual
  const description = data.map((d) => `${d.name} ${d.value.toFixed(1)}%`).join(", ");

  return (
    <div className="h-64" role="img" aria-label={`Portfolio allocation: ${description}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}