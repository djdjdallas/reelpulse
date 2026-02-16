"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const experimentTypes = [
  { value: "paywall_position", label: "Paywall Position" },
  { value: "hook_style", label: "Hook Style" },
  { value: "thumbnail", label: "Thumbnail" },
  { value: "episode_order", label: "Episode Order" },
  { value: "custom", label: "Custom" },
];

const successMetrics = [
  { value: "retention", label: "Retention" },
  { value: "conversion", label: "Conversion Rate" },
  { value: "views", label: "Views" },
  { value: "revenue", label: "Revenue" },
  { value: "engagement", label: "Engagement" },
];

export function ExperimentBuilder({ series }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    type: "paywall_position",
    seriesId: series[0]?.id || "",
    hypothesis: "",
    successMetric: "retention",
    controlName: "Control",
    treatmentName: "Treatment",
  });
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate() {
    if (!form.name.trim()) {
      toast.error("Experiment name required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Experiment created");
      router.push(`/dashboard/experiments/${data.experiment.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Experiment</h1>
        <p className="text-sm text-muted-foreground">Set up an A/B test for your series.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Experiment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g., Paywall at Episode 5 vs 8" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => update("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {experimentTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Series</Label>
              <Select value={form.seriesId} onValueChange={(v) => update("seriesId", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {series.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hypothesis</Label>
            <Input value={form.hypothesis} onChange={(e) => update("hypothesis", e.target.value)} placeholder="e.g., Moving the paywall later will increase conversion" />
          </div>

          <div className="space-y-2">
            <Label>Success Metric</Label>
            <Select value={form.successMetric} onValueChange={(v) => update("successMetric", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {successMetrics.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Control Variant Name</Label>
              <Input value={form.controlName} onChange={(e) => update("controlName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Treatment Variant Name</Label>
              <Input value={form.treatmentName} onChange={(e) => update("treatmentName", e.target.value)} />
            </div>
          </div>

          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Experiment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
