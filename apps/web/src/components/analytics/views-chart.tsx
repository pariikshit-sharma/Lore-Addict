"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ViewsOverTimePoint } from "@/lib/data/analytics";

export function ViewsChart({ data }: { data: ViewsOverTimePoint[] }) {
  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-mute">No view data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3A2F40" />
        <XAxis
          dataKey="day"
          tick={{ fill: "#8A8390", fontSize: 11 }}
          tickFormatter={(value: string) =>
            new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }
        />
        <YAxis tick={{ fill: "#8A8390", fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "#1A171F", border: "1px solid #3A2F40", borderRadius: 12 }}
          labelStyle={{ color: "#EFE9E4" }}
        />
        <Line type="monotone" dataKey="views" stroke="#8B6FA8" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
