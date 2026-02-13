"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-sm shadow-md">
      <p className="font-medium">Ep {d.episode}</p>
      <p className="text-muted-foreground">Hook @ {d.hookTimestamp}s</p>
      <p className="text-muted-foreground">Avg Watched: {d.avgWatchPct.toFixed(1)}%</p>
      <p className="text-muted-foreground">Views: {d.views.toLocaleString()}</p>
    </div>
  );
}

export function HookEffectiveness({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hook Effectiveness</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No hook data available
        </CardContent>
      </Card>
    );
  }

  const maxViews = Math.max(...data.map((d) => d.views));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Hook Effectiveness</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              type="number"
              dataKey="hookTimestamp"
              name="Hook Timestamp"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              label={{ value: "Hook @ (seconds)", position: "insideBottom", offset: -2, fill: "#94a3b8" }}
            />
            <YAxis
              type="number"
              dataKey="avgWatchPct"
              name="Avg % Watched"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              label={{ value: "Avg % Watched", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
              domain={[0, 100]}
            />
            <ZAxis
              type="number"
              dataKey="views"
              range={[40, 400]}
              domain={[0, maxViews]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={data} fill="#3b82f6" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
