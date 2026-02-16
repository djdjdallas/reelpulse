"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StatisticalSignificanceCard({ results, control, treatment }) {
  if (!results) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Statistical Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-md border p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase">p-value</p>
            <p className="text-lg font-bold">{results.pValue?.toFixed(4) ?? "—"}</p>
          </div>
          <div className="rounded-md border p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase">Lift</p>
            <p className={`text-lg font-bold ${results.lift > 0 ? "text-green-600" : results.lift < 0 ? "text-red-600" : ""}`}>
              {results.lift >= 0 ? "+" : ""}{results.lift?.toFixed(1) ?? 0}%
            </p>
          </div>
          <div className="rounded-md border p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase">Significant</p>
            <Badge variant={results.significant ? "default" : "secondary"} className="mt-1">
              {results.significant ? "Yes (p < 0.05)" : "Not yet"}
            </Badge>
          </div>
          <div className="rounded-md border p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase">Winner</p>
            <p className="text-lg font-bold">
              {results.winner
                ? results.winner === "treatment"
                  ? treatment?.name || "Treatment"
                  : control?.name || "Control"
                : "—"}
            </p>
          </div>
        </div>

        {results.confidenceInterval && (
          <div className="mt-4 rounded-md bg-muted/50 p-3 text-center text-sm">
            <span className="text-muted-foreground">95% CI: </span>
            <span className="font-medium">
              [{results.confidenceInterval.lower?.toFixed(2)}, {results.confidenceInterval.upper?.toFixed(2)}]
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
