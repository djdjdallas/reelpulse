"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function SegmentJourneyFlow({ segmentName, journeyData }) {
  if (!journeyData?.episodes?.length) return null;

  const chartData = journeyData.episodes.map((ep) => ({
    episode: `Ep ${ep.episode_number}`,
    views: ep.views,
    retention: ep.retention,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{segmentName} — Episode Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="episode" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="views" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="retention" orientation="right" tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip />
            <Line
              yAxisId="views"
              type="monotone"
              dataKey="views"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              name="Views"
            />
            <Line
              yAxisId="retention"
              type="monotone"
              dataKey="retention"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="Retention %"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
