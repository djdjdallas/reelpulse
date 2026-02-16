"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function CohortGenerator({ seriesId, onGenerated }) {
  const [type, setType] = useState("weekly");
  const [customName, setCustomName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const body = { type };
      if (type === "custom") {
        if (!customName || !dateFrom || !dateTo) {
          toast.error("Custom cohort requires name and date range");
          return;
        }
        body.name = customName;
        body.dateFrom = dateFrom;
        body.dateTo = dateTo;
      }

      const res = await fetch(`/api/series/${seriesId}/cohorts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(type === "custom" ? "Cohort created" : `Generated ${data.count} cohorts`);
      onGenerated?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Generate Cohorts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Cohort Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="pre_paywall">Pre/Post Paywall</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type === "custom" && (
          <>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g., Holiday Season" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
          </>
        )}

        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : type === "custom" ? "Create Cohort" : "Auto-Generate"}
        </Button>
      </CardContent>
    </Card>
  );
}
