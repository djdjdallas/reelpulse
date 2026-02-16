"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWidgetData } from "@/hooks/useWidgetData";

const metricLabels = {
  views: "Total Views",
  revenue: "Revenue",
  unlocks: "Unlocks",
  likes: "Likes",
};

export function MetricCardWidget({ config }) {
  const { data, loading } = useWidgetData("metric_card", config);
  const metric = config?.metric || "views";

  const value = data?.[metric] ?? 0;
  const formatted =
    metric === "revenue"
      ? `$${(value / 100).toFixed(2)}`
      : value.toLocaleString();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          {metricLabels[metric] || metric}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-2xl font-bold">{formatted}</p>
        )}
      </CardContent>
    </Card>
  );
}
