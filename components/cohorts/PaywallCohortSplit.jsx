"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PaywallCohortSplit({ prePaywall, postPaywall, paywallEpisode }) {
  if (!paywallEpisode || !prePaywall || !postPaywall) return null;

  const preAvg =
    prePaywall.length > 0
      ? prePaywall.reduce((s, r) => s + r.retention_pct, 0) / prePaywall.length
      : 0;
  const postAvg =
    postPaywall.length > 0
      ? postPaywall.reduce((s, r) => s + r.retention_pct, 0) / postPaywall.length
      : 0;

  const diff = postAvg - preAvg;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pre/Post Paywall Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase">Pre-Paywall Avg</p>
            <p className="text-2xl font-bold">{preAvg.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Episodes 1–{paywallEpisode - 1}</p>
          </div>
          <div className="rounded-md border p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase">Post-Paywall Avg</p>
            <p className="text-2xl font-bold">{postAvg.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Episodes {paywallEpisode}+</p>
          </div>
          <div className="rounded-md border p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase">Difference</p>
            <p className={`text-2xl font-bold ${diff >= 0 ? "text-green-600" : "text-red-600"}`}>
              {diff >= 0 ? "+" : ""}{diff.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {diff >= 0 ? "Better after paywall" : "Drop after paywall"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
