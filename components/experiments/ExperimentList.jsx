"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  draft: "outline",
  running: "default",
  paused: "secondary",
  completed: "secondary",
};

export function ExperimentList({ experiments }) {
  if (!experiments.length) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">No experiments yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {experiments.map((exp) => (
        <Link
          key={exp.id}
          href={`/dashboard/experiments/${exp.id}`}
          className="flex items-center justify-between rounded-md border px-4 py-3 transition-colors hover:bg-accent"
        >
          <div>
            <p className="text-sm font-medium">{exp.name}</p>
            <p className="text-xs text-muted-foreground">
              {exp.type.replace(/_/g, " ")} — {exp.success_metric}
            </p>
          </div>
          <Badge variant={statusColors[exp.status] || "outline"}>
            {exp.status}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
