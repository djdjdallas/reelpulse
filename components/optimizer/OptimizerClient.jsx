"use client";

import { useMemo } from "react";
import { PaywallRecommendation } from "./PaywallRecommendation";
import { WhatIfScenario } from "./WhatIfScenario";
import { WeakEpisodeFlags } from "./WeakEpisodeFlags";
import { buildChartData } from "@/lib/calculations/chartData";
import {
  analyzeCurrentPaywall,
  findOptimalPaywall,
  flagWeakEpisodes,
} from "@/lib/calculations/paywallOptimizer";

export function OptimizerClient({ series, episodes, metrics }) {
  const chartData = useMemo(
    () => buildChartData(episodes, metrics),
    [episodes, metrics]
  );

  const enriched = chartData.enrichedEpisodes;

  const currentAnalysis = useMemo(
    () => analyzeCurrentPaywall(enriched, series.paywall_episode),
    [enriched, series.paywall_episode]
  );

  const recommendation = useMemo(
    () => findOptimalPaywall(enriched),
    [enriched]
  );

  const weakEpisodes = useMemo(
    () => flagWeakEpisodes(enriched),
    [enriched]
  );

  if (!episodes.length || !metrics.length) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          Add episode metrics to enable the paywall optimizer. Load sample data
          from the dashboard to try it out.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Paywall Analysis + Recommendation — full width */}
      <PaywallRecommendation
        currentAnalysis={currentAnalysis}
        recommendation={recommendation}
        currentPaywall={series.paywall_episode}
      />

      {/* Recommendation details + What-If Slider — 2 col */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Score breakdown */}
        <ScoreBreakdown scores={recommendation.allScores} />
        <WhatIfScenario
          episodes={enriched}
          currentPaywall={series.paywall_episode}
        />
      </div>

      {/* Weak Episode Flags — full width */}
      <WeakEpisodeFlags weakEpisodes={weakEpisodes} />
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function ScoreBreakdown({ scores }) {
  if (!scores || scores.length === 0) return null;

  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const bestEp = sorted[0].episode;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Paywall Position Scores</CardTitle>
        <p className="text-xs text-muted-foreground">
          Higher score = better paywall lead-in. Paywall goes after the scored episode.
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-y-auto max-h-72">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>After Ep</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Cliffhanger</TableHead>
                <TableHead className="text-right">Retention</TableHead>
                <TableHead className="text-right">Demand</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((s) => (
                <TableRow
                  key={s.episode}
                  className={s.episode === bestEp ? "bg-primary/5" : ""}
                >
                  <TableCell className="font-medium">
                    {s.episode}
                    {s.episode === bestEp && (
                      <Badge variant="default" className="ml-2 text-xs">
                        Best
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {s.score}
                  </TableCell>
                  <TableCell className="text-right">{s.cliffhangerStrength}%</TableCell>
                  <TableCell className="text-right">{s.retention}%</TableCell>
                  <TableCell className="text-right">{s.nextEpDemand}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
