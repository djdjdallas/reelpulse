"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const WIDGET_TYPES = [
  { type: "metric_card", label: "Metric Card", description: "KPI number card", defaultSize: { w: 3, h: 2 } },
  { type: "revenue_trend", label: "Revenue Trend", description: "Revenue over time", defaultSize: { w: 6, h: 4 } },
  { type: "engagement_trend", label: "Engagement Trend", description: "Engagement over time", defaultSize: { w: 6, h: 4 } },
  { type: "retention_waterfall", label: "Retention Waterfall", description: "Episode retention chart", defaultSize: { w: 6, h: 4 } },
  { type: "paywall_dropoff", label: "Paywall Drop-off", description: "Conversion funnel", defaultSize: { w: 6, h: 4 } },
  { type: "hook_effectiveness", label: "Hook Effectiveness", description: "Hook score analysis", defaultSize: { w: 6, h: 4 } },
  { type: "cliffhanger_impact", label: "Cliffhanger Impact", description: "Episode-to-episode retention", defaultSize: { w: 6, h: 4 } },
  { type: "trope_performance", label: "Trope Performance", description: "Content trope analysis", defaultSize: { w: 6, h: 4 } },
  { type: "series_health_score", label: "Health Score", description: "Overall series health", defaultSize: { w: 6, h: 4 } },
  { type: "cross_platform_comparison", label: "Cross-Platform", description: "Platform comparison", defaultSize: { w: 6, h: 4 } },
  { type: "cohort_heatmap", label: "Cohort Heatmap", description: "Cohort retention grid", defaultSize: { w: 12, h: 5 } },
  { type: "experiment_status", label: "Experiments", description: "Active experiments", defaultSize: { w: 6, h: 3 } },
];

export function WidgetLibrary({ onAdd }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Widget</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {WIDGET_TYPES.map((w) => (
            <button
              key={w.type}
              onClick={() => onAdd(w)}
              className="flex items-center gap-3 rounded-md border p-3 text-left transition-colors hover:bg-accent"
            >
              <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{w.label}</p>
                <p className="text-xs text-muted-foreground">{w.description}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export { WIDGET_TYPES };
