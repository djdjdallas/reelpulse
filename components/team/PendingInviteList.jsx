"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCw, X } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function PendingInviteList({ invites, onUpdate }) {
  const [loading, setLoading] = useState(null);

  async function handleResend(inviteId) {
    setLoading(inviteId);
    try {
      const res = await fetch("/api/team/invite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, action: "resend" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to resend");
      }
      toast.success("Invite resent");
      onUpdate?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  }

  async function handleRevoke(inviteId) {
    setLoading(inviteId);
    try {
      const res = await fetch("/api/team/invite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, action: "revoke" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to revoke");
      }
      toast.success("Invite revoked");
      onUpdate?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  }

  if (!invites.length) {
    return (
      <p className="text-sm text-muted-foreground">No pending invites.</p>
    );
  }

  return (
    <div className="space-y-2">
      {invites.map((invite) => (
        <div
          key={invite.id}
          className="flex items-center justify-between rounded-md border px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium">{invite.email}</p>
            <p className="text-xs text-muted-foreground">
              <Badge variant="outline" className="mr-2 text-xs">
                {invite.role}
              </Badge>
              Expires {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleResend(invite.id)}
              disabled={loading === invite.id}
              title="Resend invite"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleRevoke(invite.id)}
              disabled={loading === invite.id}
              title="Revoke invite"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
