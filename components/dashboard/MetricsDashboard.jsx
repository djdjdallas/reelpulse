"use client";

import { useMemo } from "react";
import { StatsOverview } from "./StatsOverview";
import { SeriesHealthScore } from "./SeriesHealthScore";
import { RetentionWaterfall } from "@/components/charts/RetentionWaterfall";
import { PaywallDropoff } from "@/components/charts/PaywallDropoff";
import { HookEffectiveness } from "@/components/charts/HookEffectiveness";
import { CliffhangerImpact } from "@/components/charts/CliffhangerImpact";
import { TropePerformance } from "@/components/charts/TropePerformance";
import { buildChartData, calcConversionRate } from "@/lib/calculations/chartData";
import { calculateSeriesHealth } from "@/lib/calculations/seriesHealth";

export function MetricsDashboard({ series, episodes, metrics }) {
  const chartData = useMemo(
    () => buildChartData(episodes, metrics),
    [episodes, metrics]
  );

  const conversionRate = useMemo(
    () =>
      calcConversionRate(chartData.enrichedEpisodes, series.paywall_episode),
    [chartData.enrichedEpisodes, series.paywall_episode]
  );

  const health = useMemo(
    () =>
      calculateSeriesHealth({
        episodes: chartData.enrichedEpisodes,
        paywallEpisode: series.paywall_episode,
      }),
    [chartData.enrichedEpisodes, series.paywall_episode]
  );

  const statsWithHealth = chartData.stats
    ? { ...chartData.stats, healthScore: health.score }
    : null;

  if (!episodes.length || !metrics.length) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          No metrics data yet. Add metrics for your episodes to see charts and
          analytics here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards — 4 across */}
      <StatsOverview stats={statsWithHealth} />

      {/* Row 1: Retention + Paywall */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <RetentionWaterfall
          data={chartData.retention}
          paywallEpisode={series.paywall_episode}
        />
        <PaywallDropoff
          data={chartData.paywall}
          paywallEpisode={series.paywall_episode}
          conversionRate={conversionRate}
        />
      </div>

      {/* Row 2: Hook Effectiveness + Cliffhanger Impact */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <HookEffectiveness data={chartData.hooks} />
        <CliffhangerImpact data={chartData.cliffhangers} />
      </div>

      {/* Row 3: Health Score + Trope Performance */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <SeriesHealthScore score={health.score} breakdown={health.breakdown} />
        <TropePerformance data={chartData.tropes} />
      </div>
    </div>
  );
}
