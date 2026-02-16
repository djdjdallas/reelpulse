"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function VideoMappingDialog({ connectionId, episodes }) {
  const [open, setOpen] = useState(false);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("platform_video_mappings")
        .select("*")
        .eq("connection_id", connectionId);
      setMappings(data || []);
    }
    load();
  }, [open, connectionId]);

  async function handleMap(mappingId, episodeId) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("platform_video_mappings")
        .update({ episode_id: episodeId || null, updated_at: new Date().toISOString() })
        .eq("id", mappingId);
      if (error) throw error;
      setMappings((prev) =>
        prev.map((m) => (m.id === mappingId ? { ...m, episode_id: episodeId || null } : m))
      );
      toast.success("Mapping updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="mr-2 h-4 w-4" />
          Map Videos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Map Videos to Episodes</DialogTitle>
          <DialogDescription>
            Link platform videos to your series episodes for metric syncing.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 space-y-3 overflow-y-auto">
          {mappings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No videos found. Sync first to discover videos.
            </p>
          ) : (
            mappings.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-md border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {m.platform_video_title || m.platform_video_id}
                  </p>
                </div>
                <Select
                  value={m.episode_id || "none"}
                  onValueChange={(val) => handleMap(m.id, val === "none" ? null : val)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Unlinked" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unlinked</SelectItem>
                    {episodes.map((ep) => (
                      <SelectItem key={ep.id} value={ep.id}>
                        Ep {ep.episode_number}{ep.title ? ` — ${ep.title}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
