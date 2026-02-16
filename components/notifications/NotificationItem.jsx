"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, TrendingDown, ShieldAlert, RefreshCw, FlaskConical, Users, Info } from "lucide-react";

const typeIcons = {
  retention_drop: TrendingDown,
  health_score_dip: ShieldAlert,
  paywall_conversion: AlertTriangle,
  sync_complete: RefreshCw,
  sync_error: AlertTriangle,
  experiment_result: FlaskConical,
  team_invite: Users,
  general: Info,
};

export function NotificationItem({ notification, onRead }) {
  const Icon = typeIcons[notification.type] || Info;

  return (
    <button
      className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-accent ${
        !notification.read ? "bg-primary/5" : ""
      }`}
      onClick={() => {
        if (!notification.read) onRead?.();
      }}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      {!notification.read && (
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  );
}
