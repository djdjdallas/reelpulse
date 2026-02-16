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

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export function PlatformComparisonChart({ data }) {
  const chartData = [
    {
      metric: "Views",
      ...Object.fromEntries(data.map((d) => [d.platform, d.total_views || 0])),
    },
    {
      metric: "Likes",
      ...Object.fromEntries(data.map((d) => [d.platform, d.total_likes || 0])),
    },
    {
      metric: "Comments",
      ...Object.fromEntries(data.map((d) => [d.platform, d.total_comments || 0])),
    },
    {
      metric: "Shares",
      ...Object.fromEntries(data.map((d) => [d.platform, d.total_shares || 0])),
    },
  ];

  const platforms = data.map((d) => d.platform);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Platform Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {platforms.map((platform, i) => (
              <Bar
                key={platform}
                dataKey={platform}
                fill={COLORS[i % COLORS.length]}
                name={platform.charAt(0).toUpperCase() + platform.slice(1)}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
