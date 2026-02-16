"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const typeIcons = {
  binger: "B",
  casual: "C",
  free_viewer: "F",
  converted: "$",
  churned: "X",
  platform_origin: "P",
  custom: "*",
};

const typeColors = {
  binger: "bg-green-100 text-green-700",
  casual: "bg-blue-100 text-blue-700",
  free_viewer: "bg-gray-100 text-gray-700",
  converted: "bg-purple-100 text-purple-700",
  churned: "bg-red-100 text-red-700",
  platform_origin: "bg-yellow-100 text-yellow-700",
  custom: "bg-indigo-100 text-indigo-700",
};

export function SegmentList({ segments, onDelete, onAnalyze }) {
  if (!segments.length) {
    return (
      <p className="text-sm text-muted-foreground">No segments defined yet.</p>
    );
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`/api/segments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentId: id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Segment deleted");
      onDelete?.();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-2">
      {segments.map((s) => (
        <div key={s.id} className="flex items-center justify-between rounded-md border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded text-xs font-bold ${typeColors[s.type] || typeColors.custom}`}>
              {typeIcons[s.type] || "*"}
            </div>
            <div>
              <p className="text-sm font-medium">{s.name}</p>
              {s.description && (
                <p className="text-xs text-muted-foreground">{s.description}</p>
              )}
              <Badge variant="outline" className="mt-1 text-xs">{s.type}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onAnalyze?.(s.id)} title="Analyze">
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
