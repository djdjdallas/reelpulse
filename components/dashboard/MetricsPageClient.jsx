"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsDashboard } from "./MetricsDashboard";
import { MetricsForm } from "@/components/forms/MetricsForm";
import { CSVUpload } from "@/components/forms/CSVUpload";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";
import { useRouter } from "next/navigation";

export function MetricsPageClient({ series, episodes, initialMetrics, hasCSVUpload = false }) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const router = useRouter();

  function handleMetricSaved(newMetric) {
    setMetrics((prev) => {
      const idx = prev.findIndex((m) => m.id === newMetric.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newMetric;
        return updated;
      }
      return [...prev, newMetric];
    });
  }

  function handleCSVImported(imported) {
    setMetrics((prev) => {
      const existing = new Map(prev.map((m) => [m.id, m]));
      for (const m of imported) {
        existing.set(m.id, m);
      }
      return Array.from(existing.values());
    });
  }

  return (
    <Tabs defaultValue="charts">
      <TabsList>
        <TabsTrigger value="charts">Charts</TabsTrigger>
        <TabsTrigger value="entry">Manual Entry</TabsTrigger>
        <TabsTrigger value="csv">CSV Upload</TabsTrigger>
      </TabsList>

      <TabsContent value="charts" className="mt-4">
        <MetricsDashboard
          series={series}
          episodes={episodes}
          metrics={metrics}
        />
      </TabsContent>

      <TabsContent value="entry" className="mt-4">
        <MetricsForm episodes={episodes} onSaved={handleMetricSaved} />
      </TabsContent>

      <TabsContent value="csv" className="mt-4 space-y-4">
        {hasCSVUpload ? (
          <CSVUpload episodes={episodes} onImported={handleCSVImported} />
        ) : (
          <UpgradeBanner message="CSV upload is available on Pro and Studio plans. Upgrade to bulk-import your metrics." />
        )}
      </TabsContent>
    </Tabs>
  );
}
