"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHealthColor, getHealthBgColor } from "@/lib/calculations/seriesHealth";

export function SeriesHealthScore({ score, breakdown }) {
  if (score == null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Series Health</CardTitle>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Not enough data to calculate
        </CardContent>
      </Card>
    );
  }

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colorClass = getHealthColor(score);
  const strokeClass = getHealthBgColor(score);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Series Health Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Circular progress */}
          <div className="relative flex-shrink-0">
            <svg width="120" height="120" className="-rotate-90">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={strokeClass}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${colorClass}`}>
                {score}
              </span>
            </div>
          </div>

          {/* Breakdown */}
          {breakdown && (
            <div className="space-y-1.5 text-sm flex-1">
              <BreakdownRow label="Retention" value={breakdown.retentionConsistency} weight="30%" />
              <BreakdownRow label="Paywall Conv." value={breakdown.paywallConversion} weight="25%" />
              <BreakdownRow label="Hook Quality" value={breakdown.hookQuality} weight="20%" />
              <BreakdownRow label="Engagement" value={breakdown.engagementTrend} weight="15%" />
              <BreakdownRow label="Cliffhangers" value={breakdown.cliffhangerEffectiveness} weight="10%" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownRow({ label, value, weight }) {
  const colorClass = getHealthColor(value);
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">
        {label} <span className="text-xs">({weight})</span>
      </span>
      <span className={`font-medium ${colorClass}`}>{value}</span>
    </div>
  );
}
