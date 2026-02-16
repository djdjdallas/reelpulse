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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const platforms = [
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "reelshort", label: "ReelShort" },
  { value: "other", label: "Other" },
];

export function PlatformLinkManager({ seriesId, links, onUpdate }) {
  const [adding, setAdding] = useState(false);
  const [newLink, setNewLink] = useState({ platform: "", platform_url: "", title_on_platform: "" });
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!newLink.platform) {
      toast.error("Select a platform");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/series/${seriesId}/platform-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLink),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Platform link added");
      setNewLink({ platform: "", platform_url: "", title_on_platform: "" });
      setAdding(false);
      onUpdate?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(linkId) {
    setLoading(true);
    try {
      const res = await fetch(`/api/series/${seriesId}/platform-links`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      toast.success("Platform link removed");
      onUpdate?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Platform Links</CardTitle>
        {!adding && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Platform
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {links.map((link) => (
          <div key={link.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium capitalize">{link.platform}</p>
              {link.title_on_platform && (
                <p className="text-xs text-muted-foreground">{link.title_on_platform}</p>
              )}
              {link.platform_url && (
                <a href={link.platform_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                  {link.platform_url}
                </a>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemove(link.id)} disabled={loading}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {links.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No platform links yet.</p>
        )}

        {adding && (
          <div className="space-y-3 rounded-md border p-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={newLink.platform} onValueChange={(v) => setNewLink((l) => ({ ...l, platform: v }))}>
                <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title on Platform (optional)</Label>
              <Input
                value={newLink.title_on_platform}
                onChange={(e) => setNewLink((l) => ({ ...l, title_on_platform: e.target.value }))}
                placeholder="Series name on this platform"
              />
            </div>
            <div className="space-y-2">
              <Label>URL (optional)</Label>
              <Input
                value={newLink.platform_url}
                onChange={(e) => setNewLink((l) => ({ ...l, platform_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading}>
                {loading ? "Adding..." : "Add"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
