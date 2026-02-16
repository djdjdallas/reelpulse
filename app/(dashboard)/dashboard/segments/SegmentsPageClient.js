"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SegmentBuilder } from "@/components/segments/SegmentBuilder";
import { SegmentList } from "@/components/segments/SegmentList";
import { SegmentComparisonChart } from "@/components/segments/SegmentComparisonChart";
import { SegmentJourneyFlow } from "@/components/segments/SegmentJourneyFlow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SegmentsPageClient({ segments, analyses, series, hasAdvanced }) {
  const router = useRouter();
  const [selectedSeries, setSelectedSeries] = useState(series[0]?.id || "");
  const [analyzing, setAnalyzing] = useState(false);

  async function handleAnalyze(segmentId) {
    if (!selectedSeries) {
      toast.error("Select a series first");
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/segments/${segmentId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesId: selectedSeries }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Analysis complete");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  const selectedAnalyses = analyses.filter((a) => a.series_id === selectedSeries);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audience Segments</h1>
        <p className="text-sm text-muted-foreground">
          Define and analyze episode behavior patterns.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Analyze for Series</Label>
        <Select value={selectedSeries} onValueChange={setSelectedSeries}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select series" />
          </SelectTrigger>
          <SelectContent>
            {series.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SegmentBuilder onCreated={() => router.refresh()} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Defined Segments ({segments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SegmentList
            segments={segments}
            onDelete={() => router.refresh()}
            onAnalyze={handleAnalyze}
          />
        </CardContent>
      </Card>

      {selectedAnalyses.length > 0 && (
        <>
          <SegmentComparisonChart segments={segments} analyses={selectedAnalyses} />

          {selectedAnalyses.map((a) => {
            const seg = segments.find((s) => s.id === a.segment_id);
            return (
              <SegmentJourneyFlow
                key={a.id}
                segmentName={seg?.name || "Segment"}
                journeyData={a.journey_data}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
