"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { GENRES, PLATFORMS } from "@/lib/utils/constants";

export function SeriesForm({ workspaceId, initialData }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    genre: initialData?.genre ?? "",
    platform: initialData?.platform ?? "",
    total_episodes: initialData?.total_episodes ?? "",
    paywall_episode: initialData?.paywall_episode ?? "",
    description: initialData?.description ?? "",
    target_audience: initialData?.target_audience ?? "",
  });
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const payload = {
      title: form.title.trim(),
      genre: form.genre || null,
      platform: form.platform || null,
      total_episodes: form.total_episodes ? Number(form.total_episodes) : 0,
      paywall_episode: form.paywall_episode
        ? Number(form.paywall_episode)
        : null,
      description: form.description.trim() || null,
      target_audience: form.target_audience.trim() || null,
    };

    let result;
    if (isEditing) {
      result = await supabase
        .from("series")
        .update(payload)
        .eq("id", initialData.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("series")
        .insert({ ...payload, workspace_id: workspaceId })
        .select()
        .single();
    }

    setLoading(false);

    if (result.error) {
      toast.error(result.error.message);
      return;
    }

    toast.success(isEditing ? "Series updated!" : "Series created!");
    router.push(`/dashboard/series/${result.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Series" : "New Series"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g. The Billionaire's Secret"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Genre</Label>
              <Select
                value={form.genre}
                onValueChange={(v) => updateField("genre", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => updateField("platform", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="total_episodes">Total Episodes</Label>
              <Input
                id="total_episodes"
                type="number"
                min="0"
                placeholder="e.g. 20"
                value={form.total_episodes}
                onChange={(e) => updateField("total_episodes", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paywall_episode">Paywall Episode</Label>
              <Input
                id="paywall_episode"
                type="number"
                min="1"
                placeholder="e.g. 8"
                value={form.paywall_episode}
                onChange={(e) => updateField("paywall_episode", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your series..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_audience">Target Audience</Label>
            <Input
              id="target_audience"
              placeholder="e.g. Women 18-35, romance fans"
              value={form.target_audience}
              onChange={(e) => updateField("target_audience", e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Series"
                : "Create Series"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
