"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

export function ReportHistory({ reports }) {
  if (!reports.length) {
    return (
      <p className="text-sm text-muted-foreground">No reports generated yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {reports.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between rounded-md border px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">
              <Badge variant="outline" className="mr-2 text-xs">
                {r.format.toUpperCase()}
              </Badge>
              {format(new Date(r.created_at), "MMM d, yyyy h:mm a")}
            </p>
          </div>
          {r.storage_path && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href={r.storage_path} download>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
