"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

export function CohortComparisonChart({ cohorts, retentionData }) {
  if (!retentionData.length) return null;

  // Build chart data: one entry per episode number with retention per cohort
  const allEpisodes = [
    ...new Set(retentionData.flatMap((d) => d.retention.map((r) => r.episode_number))),
  ].sort((a, b) => a - b);

  const chartData = allEpisodes.map((ep) => {
    const point = { episode: `Ep ${ep}` };
    retentionData.forEach((cd) => {
      const cohort = cohorts.find((c) => c.id === cd.cohortId);
      const ret = cd.retention.find((r) => r.episode_number === ep);
      point[cohort?.name || cd.cohortId] = ret?.retention_pct ?? null;
    });
    return point;
  });

  const cohortNames = retentionData.map((cd) => {
    const cohort = cohorts.find((c) => c.id === cd.cohortId);
    return cohort?.name || cd.cohortId;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cohort Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="episode" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
            <Tooltip formatter={(value) => `${value?.toFixed(1)}%`} />
            <Legend />
            {cohortNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
