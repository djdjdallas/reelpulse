"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function VariantComparisonChart({ variants, metrics }) {
  if (!metrics.length) return null;

  // Get all unique dates
  const dates = [...new Set(metrics.map((m) => m.date))].sort();

  const chartData = dates.map((date) => {
    const point = { date };
    for (const v of variants) {
      const m = metrics.find((metric) => metric.variant_id === v.id && metric.date === date);
      point[`${v.name} Views`] = m?.views || 0;
      point[`${v.name} Retention`] = m?.avg_retention || 0;
    }
    return point;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {variants.map((v, i) => (
              <Bar
                key={v.id}
                dataKey={`${v.name} Views`}
                fill={i === 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
