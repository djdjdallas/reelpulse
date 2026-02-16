"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VariantComparisonChart } from "./VariantComparisonChart";
import { StatisticalSignificanceCard } from "./StatisticalSignificanceCard";
import { ExperimentMetricsForm } from "./ExperimentMetricsForm";

export function ExperimentDashboard({ experiment, variants, metrics, results }) {
  const control = variants.find((v) => v.is_control);
  const treatment = variants.find((v) => !v.is_control);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{experiment.name}</h1>
          <p className="text-sm text-muted-foreground">
            {experiment.type.replace(/_/g, " ")} — Measuring: {experiment.success_metric}
          </p>
        </div>
        <Badge variant={experiment.status === "running" ? "default" : "secondary"}>
          {experiment.status}
        </Badge>
      </div>

      {experiment.hypothesis && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Hypothesis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{experiment.hypothesis}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {variants.map((v) => {
          const vMetrics = metrics.filter((m) => m.variant_id === v.id);
          const totalViews = vMetrics.reduce((s, m) => s + m.views, 0);
          const totalSamples = vMetrics.reduce((s, m) => s + m.sample_size, 0);
          const avgRetention = vMetrics.length
            ? vMetrics.reduce((s, m) => s + m.avg_retention, 0) / vMetrics.length
            : 0;

          return (
            <Card key={v.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {v.name}
                  {v.is_control && <Badge variant="outline">Control</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sample Size</span>
                  <span className="font-medium">{totalSamples.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span className="font-medium">{totalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Retention</span>
                  <span className="font-medium">{avgRetention.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Traffic</span>
                  <span className="font-medium">{v.traffic_allocation}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {results && <StatisticalSignificanceCard results={results} control={control} treatment={treatment} />}

      <VariantComparisonChart variants={variants} metrics={metrics} />

      {control && treatment && (
        <ExperimentMetricsForm experimentId={experiment.id} variants={variants} />
      )}
    </div>
  );
}
