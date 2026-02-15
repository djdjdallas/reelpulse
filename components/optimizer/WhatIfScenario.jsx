"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import posthog from "posthog-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { estimateAtPosition } from "@/lib/calculations/paywallOptimizer";
import { ArrowRight, DollarSign, Eye, Percent } from "lucide-react";

export function WhatIfScenario({ episodes, currentPaywall }) {
  const totalEps = episodes.length;
  const [position, setPosition] = useState(
    currentPaywall || Math.max(2, Math.floor(totalEps / 3))
  );

  const debounceRef = useRef(null);
  const handleSliderChange = useCallback(([v]) => {
    setPosition(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      posthog.capture("whatif_slider_used", { new_position: v, current_paywall: currentPaywall });
    }, 500);
  }, [currentPaywall]);
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const currentEstimate = useMemo(
    () =>
      currentPaywall
        ? estimateAtPosition(episodes, currentPaywall)
        : { estimatedViews: 0, estimatedConversion: 0, estimatedRevenue: 0 },
    [episodes, currentPaywall]
  );

  const newEstimate = useMemo(
    () => estimateAtPosition(episodes, position),
    [episodes, position]
  );

  if (totalEps < 3) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What-If Scenario</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Need at least 3 episodes to run what-if analysis.
        </CardContent>
      </Card>
    );
  }

  const viewsDiff = newEstimate.estimatedViews - currentEstimate.estimatedViews;
  const revDiff = newEstimate.estimatedRevenue - currentEstimate.estimatedRevenue;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">What-If Scenario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Paywall Position
            </span>
            <Badge variant="secondary" className="text-sm">
              Episode {position}
            </Badge>
          </div>
          <Slider
            min={2}
            max={totalEps - 1}
            step={1}
            value={[position]}
            onValueChange={handleSliderChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Ep 2</span>
            <span>Ep {totalEps - 1}</span>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {/* Current */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              {currentPaywall ? `Current (Ep ${currentPaywall})` : "No Paywall"}
            </h4>
            <ComparisonRow
              icon={Eye}
              label="Est. Paid Views"
              value={currentEstimate.estimatedViews.toLocaleString()}
            />
            <ComparisonRow
              icon={Percent}
              label="Conversion"
              value={`${currentEstimate.estimatedConversion}%`}
            />
            <ComparisonRow
              icon={DollarSign}
              label="Est. Revenue"
              value={`$${(currentEstimate.estimatedRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
          </div>

          {/* New position */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
            <h4 className="text-sm font-medium text-primary">
              Scenario (Ep {position})
            </h4>
            <ComparisonRow
              icon={Eye}
              label="Est. Paid Views"
              value={newEstimate.estimatedViews.toLocaleString()}
              diff={viewsDiff}
            />
            <ComparisonRow
              icon={Percent}
              label="Conversion"
              value={`${newEstimate.estimatedConversion}%`}
              diff={newEstimate.estimatedConversion - currentEstimate.estimatedConversion}
              suffix="%"
            />
            <ComparisonRow
              icon={DollarSign}
              label="Est. Revenue"
              value={`$${(newEstimate.estimatedRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              diff={revDiff / 100}
              prefix="$"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonRow({ icon: Icon, label, value, diff, prefix = "", suffix = "" }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-right">
        <span className="font-medium">{value}</span>
        {diff != null && diff !== 0 && (
          <span
            className={`ml-2 text-xs ${diff > 0 ? "text-success" : "text-destructive"}`}
          >
            {diff > 0 ? "+" : ""}
            {prefix}
            {typeof diff === "number" ? diff.toLocaleString(undefined, { maximumFractionDigits: 0 }) : diff}
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
