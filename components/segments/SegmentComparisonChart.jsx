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

export function SegmentComparisonChart({ segments, analyses }) {
  if (!analyses.length) return null;

  const chartData = analyses.map((a) => {
    const seg = segments.find((s) => s.id === a.segment_id);
    return {
      name: seg?.name || "Unknown",
      "Avg Retention": a.avg_retention || 0,
      "Conversion Rate": a.conversion_rate || 0,
      "Avg Views/Episode": Math.round(a.avg_views_per_episode || 0),
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Segment Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Avg Retention" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Conversion Rate" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
