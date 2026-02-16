"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getColor(pct) {
  if (pct >= 80) return "bg-green-600 text-white";
  if (pct >= 60) return "bg-green-500 text-white";
  if (pct >= 40) return "bg-yellow-500 text-white";
  if (pct >= 20) return "bg-orange-500 text-white";
  if (pct > 0) return "bg-red-500 text-white";
  return "bg-muted text-muted-foreground";
}

export function CohortRetentionHeatmap({ cohorts, retentionData }) {
  if (!cohorts.length || !retentionData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Retention Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Generate cohorts to see the retention heatmap.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get all episode numbers across all cohorts
  const allEpisodes = [
    ...new Set(retentionData.flatMap((d) => d.retention.map((r) => r.episode_number))),
  ].sort((a, b) => a - b);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Retention Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-background px-2 py-1 text-left font-medium">Cohort</th>
                {allEpisodes.map((ep) => (
                  <th key={ep} className="px-2 py-1 text-center font-medium">Ep {ep}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {retentionData.map((cohortData) => {
                const cohort = cohorts.find((c) => c.id === cohortData.cohortId);
                return (
                  <tr key={cohortData.cohortId}>
                    <td className="sticky left-0 bg-background px-2 py-1 font-medium whitespace-nowrap">
                      {cohort?.name || "Unknown"}
                    </td>
                    {allEpisodes.map((ep) => {
                      const ret = cohortData.retention.find((r) => r.episode_number === ep);
                      const pct = ret?.retention_pct ?? 0;
                      return (
                        <td key={ep} className="px-1 py-1">
                          <div
                            className={`flex h-8 w-12 items-center justify-center rounded text-xs font-medium ${getColor(pct)}`}
                            title={`${pct.toFixed(1)}%`}
                          >
                            {pct.toFixed(0)}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
