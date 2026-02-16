"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export function DashboardSwitcher({ dashboards, currentId, onChange, onNew }) {
  return (
    <div className="flex items-center gap-2">
      <Select value={currentId || ""} onValueChange={onChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select dashboard" />
        </SelectTrigger>
        <SelectContent>
          {dashboards.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name} {d.is_default && "(Default)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" onClick={onNew} title="New dashboard">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
