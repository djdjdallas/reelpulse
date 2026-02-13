"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Target, Lightbulb } from "lucide-react";

export function PaywallRecommendation({
  currentAnalysis,
  recommendation,
  currentPaywall,
}) {
  return (
    <div className="space-y-4">
      {/* Current Paywall Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Current Paywall Analysis
            {currentPaywall && (
              <Badge variant="outline" className="ml-auto">
                Paywall at Episode {currentPaywall}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentPaywall ? (
            <p className="text-sm text-muted-foreground">
              No paywall is currently set for this series.
            </p>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              <StatBox
                label="Drop-off Rate"
                value={`${currentAnalysis.dropOffPct.toFixed(1)}%`}
                icon={TrendingDown}
                color={
                  currentAnalysis.dropOffPct > 60
                    ? "text-destructive"
                    : currentAnalysis.dropOffPct > 40
                    ? "text-warning"
                    : "text-success"
                }
              />
              <StatBox
                label="Conversion Rate"
                value={`${currentAnalysis.conversionRate.toFixed(1)}%`}
                icon={TrendingUp}
                color={
                  currentAnalysis.conversionRate > 50
                    ? "text-success"
                    : currentAnalysis.conversionRate > 30
                    ? "text-warning"
                    : "text-destructive"
                }
              />
              <StatBox
                label="Free Views"
                value={currentAnalysis.viewsBeforePaywall.toLocaleString()}
                color="text-foreground"
              />
              <StatBox
                label="Paid Views"
                value={currentAnalysis.viewsAfterPaywall.toLocaleString()}
                color="text-foreground"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendation */}
      {recommendation.position && (
        <Alert className="border-primary/50 bg-primary/5">
          <Lightbulb className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">
            Recommended: Move paywall to Episode {recommendation.position}
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm text-muted-foreground">
            {recommendation.reasoning}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className={`h-3.5 w-3.5 ${color}`} />}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
