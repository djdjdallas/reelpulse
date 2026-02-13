"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CliffhangerImpact({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cliffhanger Impact</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No cliffhanger data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cliffhanger Impact</CardTitle>
        <p className="text-xs text-muted-foreground">
          Next-episode view % per episode
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="episode"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              label={{ value: "Next Ep View %", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f8fafc",
              }}
              formatter={(value) => [`${value.toFixed(1)}%`, "Next Ep View %"]}
            />
            <Bar dataKey="nextEpViewPct" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.nextEpViewPct >= 90
                      ? "#22c55e"
                      : entry.nextEpViewPct >= 70
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
