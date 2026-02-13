"use client";

import { useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export function MetricsForm({ episodes, onSaved }) {
  const [form, setForm] = useState({
    episode_id: "",
    date: new Date(),
    views: "",
    watch_time_seconds: "",
    avg_percent_watched: "",
    drop_off_point_seconds: "",
    likes: "",
    shares: "",
    comments: "",
    unlocks: "",
    revenue_dollars: "",
  });
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.episode_id) {
      toast.error("Select an episode");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const payload = {
      episode_id: form.episode_id,
      date: format(form.date, "yyyy-MM-dd"),
      views: form.views ? Number(form.views) : 0,
      watch_time_seconds: form.watch_time_seconds
        ? Number(form.watch_time_seconds)
        : 0,
      avg_percent_watched: form.avg_percent_watched
        ? Number(form.avg_percent_watched)
        : 0,
      drop_off_point_seconds: form.drop_off_point_seconds
        ? Number(form.drop_off_point_seconds)
        : null,
      likes: form.likes ? Number(form.likes) : 0,
      shares: form.shares ? Number(form.shares) : 0,
      comments: form.comments ? Number(form.comments) : 0,
      unlocks: form.unlocks ? Number(form.unlocks) : 0,
      revenue_cents: form.revenue_dollars
        ? Math.round(Number(form.revenue_dollars) * 100)
        : 0,
    };

    const { data, error } = await supabase
      .from("episode_metrics")
      .upsert(payload, { onConflict: "episode_id,date" })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Metrics saved!");
    onSaved?.(data);

    // Reset form but keep episode and date for "Save + Add Another"
    setForm((prev) => ({
      ...prev,
      views: "",
      watch_time_seconds: "",
      avg_percent_watched: "",
      drop_off_point_seconds: "",
      likes: "",
      shares: "",
      comments: "",
      unlocks: "",
      revenue_dollars: "",
    }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Manual Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Episode *</Label>
              <Select
                value={form.episode_id}
                onValueChange={(v) => updateField("episode_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select episode" />
                </SelectTrigger>
                <SelectContent>
                  {episodes.map((ep) => (
                    <SelectItem key={ep.id} value={ep.id}>
                      Ep {ep.episode_number}
                      {ep.title ? ` — ${ep.title}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(form.date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.date}
                    onSelect={(d) => {
                      if (d) {
                        updateField("date", d);
                        setCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            <NumField
              label="Views"
              value={form.views}
              onChange={(v) => updateField("views", v)}
              placeholder="0"
            />
            <NumField
              label="Watch Time (sec)"
              value={form.watch_time_seconds}
              onChange={(v) => updateField("watch_time_seconds", v)}
              placeholder="0"
            />
            <NumField
              label="Avg % Watched"
              value={form.avg_percent_watched}
              onChange={(v) => updateField("avg_percent_watched", v)}
              placeholder="0.0"
              step="0.1"
              max="100"
            />
            <NumField
              label="Drop-off (sec)"
              value={form.drop_off_point_seconds}
              onChange={(v) => updateField("drop_off_point_seconds", v)}
              placeholder="—"
            />
            <NumField
              label="Likes"
              value={form.likes}
              onChange={(v) => updateField("likes", v)}
              placeholder="0"
            />
            <NumField
              label="Shares"
              value={form.shares}
              onChange={(v) => updateField("shares", v)}
              placeholder="0"
            />
            <NumField
              label="Comments"
              value={form.comments}
              onChange={(v) => updateField("comments", v)}
              placeholder="0"
            />
            <NumField
              label="Unlocks"
              value={form.unlocks}
              onChange={(v) => updateField("unlocks", v)}
              placeholder="0"
            />
            <NumField
              label="Revenue ($)"
              value={form.revenue_dollars}
              onChange={(v) => updateField("revenue_dollars", v)}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save + Add Another"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function NumField({ label, value, onChange, placeholder, step, max }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        min="0"
        max={max}
        step={step || "1"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
