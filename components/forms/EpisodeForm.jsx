"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TropeTagSelect } from "./TropeTagSelect";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function EpisodeForm({ seriesId, episode, open, onOpenChange, onSaved }) {
  const isEditing = !!episode;

  const [form, setForm] = useState({
    episode_number: episode?.episode_number ?? "",
    title: episode?.title ?? "",
    duration_seconds: episode?.duration_seconds ?? "",
    is_free: episode?.is_free ?? true,
    hook_timestamp_seconds: episode?.hook_timestamp_seconds ?? "",
    cliffhanger_timestamp_seconds: episode?.cliffhanger_timestamp_seconds ?? "",
    trope_tags: episode?.trope_tags ?? [],
    script_text: episode?.script_text ?? "",
    notes: episode?.notes ?? "",
  });
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.episode_number) {
      toast.error("Episode number is required");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const payload = {
      series_id: seriesId,
      episode_number: Number(form.episode_number),
      title: form.title.trim() || null,
      duration_seconds: form.duration_seconds
        ? Number(form.duration_seconds)
        : null,
      is_free: form.is_free,
      hook_timestamp_seconds: form.hook_timestamp_seconds
        ? Number(form.hook_timestamp_seconds)
        : null,
      cliffhanger_timestamp_seconds: form.cliffhanger_timestamp_seconds
        ? Number(form.cliffhanger_timestamp_seconds)
        : null,
      trope_tags: form.trope_tags,
      script_text: form.script_text.trim() || null,
      notes: form.notes.trim() || null,
    };

    let result;
    if (isEditing) {
      result = await supabase
        .from("episodes")
        .update(payload)
        .eq("id", episode.id)
        .select()
        .single();
    } else {
      result = await supabase.from("episodes").insert(payload).select().single();
    }

    setLoading(false);

    if (result.error) {
      toast.error(result.error.message);
      return;
    }

    toast.success(isEditing ? "Episode updated!" : "Episode added!");
    onSaved(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Episode ${episode.episode_number}` : "Add Episode"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ep_number">Episode # *</Label>
              <Input
                id="ep_number"
                type="number"
                min="1"
                value={form.episode_number}
                onChange={(e) => updateField("episode_number", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ep_title">Title</Label>
              <Input
                id="ep_title"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Episode title"
              />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={form.duration_seconds}
                onChange={(e) => updateField("duration_seconds", e.target.value)}
                placeholder="e.g. 90"
              />
            </div>
            <div className="space-y-2">
              <Label>Free / Paid</Label>
              <Select
                value={form.is_free ? "free" : "paid"}
                onValueChange={(v) => updateField("is_free", v === "free")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hook">Hook @ (seconds)</Label>
              <Input
                id="hook"
                type="number"
                min="0"
                value={form.hook_timestamp_seconds}
                onChange={(e) =>
                  updateField("hook_timestamp_seconds", e.target.value)
                }
                placeholder="e.g. 5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliffhanger">Cliffhanger @ (seconds)</Label>
              <Input
                id="cliffhanger"
                type="number"
                min="0"
                value={form.cliffhanger_timestamp_seconds}
                onChange={(e) =>
                  updateField("cliffhanger_timestamp_seconds", e.target.value)
                }
                placeholder="e.g. 85"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Trope Tags</Label>
            <TropeTagSelect
              value={form.trope_tags}
              onChange={(tags) => updateField("trope_tags", tags)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="script">Script Text</Label>
            <Textarea
              id="script"
              value={form.script_text}
              onChange={(e) => updateField("script_text", e.target.value)}
              rows={3}
              placeholder="Paste script text..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={2}
              placeholder="Production notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Add Episode"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
