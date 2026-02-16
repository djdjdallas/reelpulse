"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformComparisonChart } from "./PlatformComparisonChart";

export function CrossPlatformOverview({ platformMetrics }) {
  if (!platformMetrics.length) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          Add platform links above to see cross-platform comparison data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {platformMetrics.map((pm) => (
          <Card key={pm.platform}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm capitalize">{pm.platform}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{(pm.total_views || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retention</span>
                <span className="font-medium">{(pm.avg_retention || 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Engagement</span>
                <span className="font-medium">
                  {((pm.total_likes || 0) + (pm.total_comments || 0) + (pm.total_shares || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">${((pm.total_revenue_cents || 0) / 100).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PlatformComparisonChart data={platformMetrics} />
    </div>
  );
}
