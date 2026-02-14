"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EpisodeForm } from "./EpisodeForm";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Copy } from "lucide-react";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";

export function EpisodeManager({ seriesId, initialEpisodes, maxEpisodes = Infinity }) {
  const [episodes, setEpisodes] = useState(initialEpisodes);
  const remaining = maxEpisodes - episodes.length;
  const atLimit = remaining <= 0;
  const [formOpen, setFormOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCount, setBulkCount] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  function handleSaved(savedEp) {
    setEpisodes((prev) => {
      const idx = prev.findIndex((e) => e.id === savedEp.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedEp;
        return updated.sort((a, b) => a.episode_number - b.episode_number);
      }
      return [...prev, savedEp].sort(
        (a, b) => a.episode_number - b.episode_number
      );
    });
    setEditingEpisode(null);
  }

  function openEdit(ep) {
    setEditingEpisode(ep);
    setFormOpen(true);
  }

  function openNew() {
    setEditingEpisode(null);
    setFormOpen(true);
  }

  async function handleDelete(ep) {
    if (!confirm(`Delete episode ${ep.episode_number}?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("episodes").delete().eq("id", ep.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setEpisodes((prev) => prev.filter((e) => e.id !== ep.id));
    toast.success(`Episode ${ep.episode_number} deleted`);
  }

  async function handleBulkAdd(e) {
    e.preventDefault();
    const maxBulk = maxEpisodes === Infinity ? 100 : Math.min(100, remaining);
    const count = Number(bulkCount);
    if (!count || count < 1 || count > maxBulk) {
      toast.error(`Enter a number between 1 and ${maxBulk}`);
      return;
    }

    setBulkLoading(true);
    const supabase = createClient();

    const existingNumbers = new Set(episodes.map((ep) => ep.episode_number));
    const newEpisodes = [];
    let nextNum = 1;

    for (let i = 0; i < count; i++) {
      while (existingNumbers.has(nextNum)) nextNum++;
      newEpisodes.push({
        series_id: seriesId,
        episode_number: nextNum,
        is_free: true,
      });
      existingNumbers.add(nextNum);
      nextNum++;
    }

    const { data, error } = await supabase
      .from("episodes")
      .insert(newEpisodes)
      .select();

    setBulkLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setEpisodes((prev) =>
      [...prev, ...data].sort((a, b) => a.episode_number - b.episode_number)
    );
    toast.success(`Added ${count} episodes`);
    setBulkOpen(false);
    setBulkCount("");
  }

  function formatSeconds(s) {
    if (!s) return "—";
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Episodes ({episodes.length})
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)} disabled={atLimit}>
            <Copy className="mr-2 h-4 w-4" />
            Bulk Add
          </Button>
          <Button size="sm" onClick={openNew} disabled={atLimit}>
            <Plus className="mr-2 h-4 w-4" />
            Add Episode
          </Button>
        </div>
      </div>

      {atLimit && (
        <UpgradeBanner
          message={`You've reached the ${maxEpisodes}-episode limit for your plan. Upgrade to add more episodes.`}
        />
      )}

      {episodes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No episodes yet. Click &quot;Add Episode&quot; or &quot;Bulk Add&quot;
          to get started.
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-20">Duration</TableHead>
                <TableHead className="w-20">Type</TableHead>
                <TableHead className="w-20">Hook @</TableHead>
                <TableHead className="w-24">Cliffhanger @</TableHead>
                <TableHead>Tropes</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {episodes.map((ep) => (
                <TableRow key={ep.id}>
                  <TableCell className="font-medium">
                    {ep.episode_number}
                  </TableCell>
                  <TableCell>{ep.title || "—"}</TableCell>
                  <TableCell>{formatSeconds(ep.duration_seconds)}</TableCell>
                  <TableCell>
                    <Badge variant={ep.is_free ? "secondary" : "default"}>
                      {ep.is_free ? "Free" : "Paid"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ep.hook_timestamp_seconds
                      ? `${ep.hook_timestamp_seconds}s`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {ep.cliffhanger_timestamp_seconds
                      ? `${ep.cliffhanger_timestamp_seconds}s`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(ep.trope_tags || []).slice(0, 2).map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="text-xs whitespace-nowrap"
                        >
                          {t}
                        </Badge>
                      ))}
                      {(ep.trope_tags || []).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{ep.trope_tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(ep)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(ep)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EpisodeForm
        seriesId={seriesId}
        episode={editingEpisode}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={handleSaved}
      />

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Bulk Add Episodes</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBulkAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulkCount">Number of episodes to add</Label>
              <Input
                id="bulkCount"
                type="number"
                min="1"
                max={maxEpisodes === Infinity ? 100 : Math.min(100, remaining)}
                value={bulkCount}
                onChange={(e) => setBulkCount(e.target.value)}
                placeholder="e.g. 20"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBulkOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={bulkLoading}>
                {bulkLoading ? "Adding..." : "Add Episodes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
