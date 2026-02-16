"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function NotificationPreferencesForm({ preferences: initial }) {
  const [prefs, setPrefs] = useState(
    initial || {
      email_enabled: true,
      in_app_enabled: true,
      retention_drop_threshold: 15,
      health_score_dip_threshold: 10,
      paywall_conversion_threshold: 5,
      weekly_digest: true,
    }
  );
  const [loading, setLoading] = useState(false);

  function toggle(key) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  function setThreshold(key, value) {
    setPrefs((p) => ({ ...p, [key]: parseFloat(value) || 0 }));
  }

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Preferences saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Alert Preferences</CardTitle>
        <CardDescription>
          Configure when you want to be notified about metric changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Email notifications</Label>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.email_enabled}
              onClick={() => toggle("email_enabled")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs.email_enabled ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefs.email_enabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <Label>In-app notifications</Label>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.in_app_enabled}
              onClick={() => toggle("in_app_enabled")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs.in_app_enabled ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefs.in_app_enabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <Label>Weekly digest</Label>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.weekly_digest}
              onClick={() => toggle("weekly_digest")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs.weekly_digest ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefs.weekly_digest ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h4 className="text-sm font-medium">Alert Thresholds</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="retention-threshold">Retention drop (%)</Label>
              <Input
                id="retention-threshold"
                type="number"
                min="1"
                max="100"
                step="1"
                value={prefs.retention_drop_threshold}
                onChange={(e) => setThreshold("retention_drop_threshold", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="health-threshold">Health score dip (pts)</Label>
              <Input
                id="health-threshold"
                type="number"
                min="1"
                max="100"
                step="1"
                value={prefs.health_score_dip_threshold}
                onChange={(e) => setThreshold("health_score_dip_threshold", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paywall-threshold">Conversion drop (%)</Label>
              <Input
                id="paywall-threshold"
                type="number"
                min="1"
                max="100"
                step="1"
                value={prefs.paywall_conversion_threshold}
                onChange={(e) => setThreshold("paywall_conversion_threshold", e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
