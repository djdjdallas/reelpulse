"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ExperimentMetricsForm({ experimentId, variants }) {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [values, setValues] = useState(
    Object.fromEntries(
      variants.map((v) => [
        v.id,
        { sample_size: "", views: "", avg_retention: "", unlocks: "", revenue_cents: "" },
      ])
    )
  );
  const [loading, setLoading] = useState(false);

  function updateVariant(variantId, field, value) {
    setValues((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], [field]: value },
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const metricsData = variants.map((v) => ({
        variantId: v.id,
        date,
        sample_size: parseInt(values[v.id]?.sample_size || "0", 10),
        views: parseInt(values[v.id]?.views || "0", 10),
        avg_retention: parseFloat(values[v.id]?.avg_retention || "0"),
        unlocks: parseInt(values[v.id]?.unlocks || "0", 10),
        revenue_cents: parseInt(values[v.id]?.revenue_cents || "0", 10),
      }));

      const res = await fetch(`/api/experiments/${experimentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics: metricsData }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Metrics recorded");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Record Variant Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
        </div>

        {variants.map((v) => (
          <div key={v.id} className="space-y-3 rounded-md border p-4">
            <p className="text-sm font-medium">{v.name} {v.is_control && "(Control)"}</p>
            <div className="grid gap-3 sm:grid-cols-5">
              <div className="space-y-1">
                <Label className="text-xs">Sample Size</Label>
                <Input type="number" min="0" value={values[v.id]?.sample_size} onChange={(e) => updateVariant(v.id, "sample_size", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Views</Label>
                <Input type="number" min="0" value={values[v.id]?.views} onChange={(e) => updateVariant(v.id, "views", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Retention %</Label>
                <Input type="number" min="0" max="100" step="0.1" value={values[v.id]?.avg_retention} onChange={(e) => updateVariant(v.id, "avg_retention", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Unlocks</Label>
                <Input type="number" min="0" value={values[v.id]?.unlocks} onChange={(e) => updateVariant(v.id, "unlocks", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Revenue (cents)</Label>
                <Input type="number" min="0" value={values[v.id]?.revenue_cents} onChange={(e) => updateVariant(v.id, "revenue_cents", e.target.value)} />
              </div>
            </div>
          </div>
        ))}

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Metrics"}
        </Button>
      </CardContent>
    </Card>
  );
}
