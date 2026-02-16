"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Play } from "lucide-react";
import { toast } from "sonner";

const typeLabels = {
  weekly_series: "Weekly Series",
  monthly_portfolio: "Monthly Portfolio",
  post_series_retrospective: "Post-Series Retrospective",
  custom: "Custom",
};

export function ReportTemplateList({ templates, onUpdate }) {
  const [loading, setLoading] = useState(null);

  async function handleDelete(id) {
    setLoading(id);
    try {
      const res = await fetch(`/api/reports/templates`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Template deleted");
      onUpdate?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  }

  if (!templates.length) {
    return (
      <p className="text-sm text-muted-foreground">No report templates saved yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {templates.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between rounded-md border px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium">{t.name}</p>
            <Badge variant="secondary" className="text-xs">
              {typeLabels[t.type] || t.type}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(t.id)}
              disabled={loading === t.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
