"use client";

import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const statusConfig = {
  active: { variant: "default", label: "Connected" },
  expired: { variant: "destructive", label: "Token Expired" },
  revoked: { variant: "outline", label: "Revoked" },
  error: { variant: "destructive", label: "Error" },
};

export function SyncStatusBadge({ connection }) {
  const config = statusConfig[connection.status] || statusConfig.active;

  return (
    <div className="flex flex-col items-end gap-1">
      <Badge variant={config.variant}>{config.label}</Badge>
      {connection.last_synced_at && (
        <span className="text-xs text-muted-foreground">
          Last synced {formatDistanceToNow(new Date(connection.last_synced_at), { addSuffix: true })}
        </span>
      )}
    </div>
  );
}
