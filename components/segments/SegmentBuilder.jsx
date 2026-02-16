"use client";

import { useState } from "react";
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

const segmentTypes = [
  { value: "binger", label: "Binger Pattern", description: "High retention, rapid view accumulation" },
  { value: "casual", label: "Casual Viewer", description: "Moderate engagement, lower retention" },
  { value: "free_viewer", label: "Free Viewer", description: "Free episodes without conversions" },
  { value: "converted", label: "Converted", description: "Episodes driving paywall conversions" },
  { value: "churned", label: "Churned", description: "Significant view drops" },
  { value: "custom", label: "Custom", description: "Define your own rules" },
];

export function SegmentBuilder({ onCreated }) {
  const [type, setType] = useState("binger");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedType = segmentTypes.find((t) => t.value === type);

  async function handleCreate() {
    const segmentName = name.trim() || selectedType?.label || type;
    setLoading(true);
    try {
      const res = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: segmentName,
          type,
          description: description.trim() || selectedType?.description || "",
          rules: {},
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Segment created");
      setName("");
      setDescription("");
      onCreated?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Create Segment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Segment Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {segmentTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label} — {t.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Name (optional)</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={selectedType?.label || "Segment name"}
          />
        </div>

        <div className="space-y-2">
          <Label>Description (optional)</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={selectedType?.description || "Describe this segment"}
          />
        </div>

        <Button onClick={handleCreate} disabled={loading}>
          {loading ? "Creating..." : "Create Segment"}
        </Button>
      </CardContent>
    </Card>
  );
}
