"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { createClient } from "@/lib/supabase/client";

export function WidgetConfigDialog({ widget, open, onClose, onSave }) {
  const [title, setTitle] = useState(widget?.title || "");
  const [config, setConfig] = useState(widget?.config || {});
  const [series, setSeries] = useState([]);

  useEffect(() => {
    async function loadSeries() {
      const supabase = createClient();
      const { data } = await supabase.from("series").select("id, title").order("title");
      setSeries(data || []);
    }
    loadSeries();
  }, []);

  useEffect(() => {
    if (widget) {
      setTitle(widget.title || "");
      setConfig(widget.config || {});
    }
  }, [widget]);

  function handleSave() {
    onSave({ ...widget, title, config });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Widget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Series</Label>
            <Select
              value={config.seriesId || ""}
              onValueChange={(v) => setConfig((c) => ({ ...c, seriesId: v }))}
            >
              <SelectTrigger><SelectValue placeholder="Select series" /></SelectTrigger>
              <SelectContent>
                {series.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {widget?.widget_type === "metric_card" && (
            <div className="space-y-2">
              <Label>Metric</Label>
              <Select
                value={config.metric || "views"}
                onValueChange={(v) => setConfig((c) => ({ ...c, metric: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="unlocks">Unlocks</SelectItem>
                  <SelectItem value="likes">Likes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
