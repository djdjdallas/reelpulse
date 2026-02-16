"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SyncStatusBadge } from "./SyncStatusBadge";
import { toast } from "sonner";

const platformInfo = {
  tiktok: {
    name: "TikTok",
    description: "Sync views, likes, shares, and comments from TikTok.",
    color: "bg-black text-white",
  },
  youtube: {
    name: "YouTube",
    description: "Sync views, watch time, retention, and revenue from YouTube.",
    color: "bg-red-600 text-white",
  },
  reelshort: {
    name: "ReelShort",
    description: "No public API available. Use manual entry or CSV import.",
    color: "bg-purple-600 text-white",
    disabled: true,
  },
};

export function PlatformConnectionCard({ platform, connection, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const info = platformInfo[platform] || {};

  async function handleConnect() {
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/${platform}/authorize`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/${platform}/disconnect`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success(`${info.name} disconnected`);
      onUpdate?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/${platform}/sync`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Synced ${data.recordsSynced} records`);
      onUpdate?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${info.color}`}>
              {info.name?.[0]}
            </div>
            <div>
              <CardTitle className="text-base">{info.name}</CardTitle>
              <CardDescription>{info.description}</CardDescription>
            </div>
          </div>
          {connection && <SyncStatusBadge connection={connection} />}
        </div>
      </CardHeader>
      <CardContent>
        {info.disabled ? (
          <p className="text-sm text-muted-foreground">Manual/CSV only</p>
        ) : connection ? (
          <div className="flex items-center gap-2">
            <p className="flex-1 text-sm text-muted-foreground">
              Connected as <span className="font-medium text-foreground">{connection.platform_username}</span>
            </p>
            <Button variant="outline" size="sm" onClick={handleSync} disabled={loading}>
              {loading ? "Syncing..." : "Sync Now"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDisconnect} disabled={loading} className="text-destructive">
              Disconnect
            </Button>
          </div>
        ) : (
          <Button onClick={handleConnect} disabled={loading}>
            {loading ? "Connecting..." : `Connect ${info.name}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
