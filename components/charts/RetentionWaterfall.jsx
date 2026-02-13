"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RetentionWaterfall({ data, paywallEpisode }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Retention Waterfall</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No metrics data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Retention Waterfall</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="episode"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              label={{ value: "Episode", position: "insideBottom", offset: -2, fill: "#94a3b8" }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              label={{ value: "Avg % Watched", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f8fafc",
              }}
              formatter={(value) => [`${value.toFixed(1)}%`, "Avg % Watched"]}
            />
            {paywallEpisode && (
              <ReferenceLine
                x={`Ep ${paywallEpisode}`}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{
                  value: "Paywall",
                  fill: "#f59e0b",
                  fontSize: 11,
                  position: "top",
                }}
              />
            )}
            <Bar dataKey="avgWatchPct" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.avgWatchPct >= 70 ? "#22c55e" : entry.avgWatchPct >= 50 ? "#f59e0b" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
