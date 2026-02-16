"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DashboardGrid } from "@/components/dashboard-builder/DashboardGrid";
import { DashboardSwitcher } from "@/components/dashboard-builder/DashboardSwitcher";
import { WidgetLibrary } from "@/components/dashboard-builder/WidgetLibrary";
import { Edit2, Save } from "lucide-react";
import { toast } from "sonner";

export function CustomDashboardClient({ initialDashboards }) {
  const router = useRouter();
  const [dashboards, setDashboards] = useState(initialDashboards);
  const [currentId, setCurrentId] = useState(initialDashboards[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);

  const currentDashboard = dashboards.find((d) => d.id === currentId);
  const widgets = currentDashboard?.dashboard_widgets || [];

  async function handleNewDashboard() {
    try {
      const res = await fetch("/api/dashboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Dashboard ${dashboards.length + 1}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newDash = { ...data.dashboard, dashboard_widgets: [] };
      setDashboards((prev) => [...prev, newDash]);
      setCurrentId(newDash.id);
      setIsEditing(true);
      toast.success("Dashboard created");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleAddWidget(widgetDef) {
    if (!currentId) return;
    try {
      const res = await fetch(`/api/dashboards/${currentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addWidget: widgetDef }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDashboards((prev) =>
        prev.map((d) =>
          d.id === currentId
            ? { ...d, dashboard_widgets: [...d.dashboard_widgets, data.widget] }
            : d
        )
      );
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleRemoveWidget(widgetId) {
    try {
      await fetch(`/api/dashboards/${currentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeWidgetId: widgetId }),
      });

      setDashboards((prev) =>
        prev.map((d) =>
          d.id === currentId
            ? { ...d, dashboard_widgets: d.dashboard_widgets.filter((w) => w.id !== widgetId) }
            : d
        )
      );
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleUpdateWidget(updatedWidget) {
    try {
      await fetch(`/api/dashboards/${currentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateWidget: updatedWidget }),
      });

      setDashboards((prev) =>
        prev.map((d) =>
          d.id === currentId
            ? {
                ...d,
                dashboard_widgets: d.dashboard_widgets.map((w) =>
                  w.id === updatedWidget.id ? { ...w, ...updatedWidget } : w
                ),
              }
            : d
        )
      );
    } catch (err) {
      toast.error(err.message);
    }
  }

  const handleLayoutChange = useCallback(
    async (updates) => {
      if (!currentId) return;

      setDashboards((prev) =>
        prev.map((d) =>
          d.id === currentId
            ? {
                ...d,
                dashboard_widgets: d.dashboard_widgets.map((w) => {
                  const update = updates.find((u) => u.id === w.id);
                  return update ? { ...w, position: update.position } : w;
                }),
              }
            : d
        )
      );

      // Save to server
      await fetch(`/api/dashboards/${currentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutUpdates: updates }),
      }).catch(() => {});
    },
    [currentId]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Custom Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Build your own analytics dashboard with drag-and-drop widgets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DashboardSwitcher
            dashboards={dashboards}
            currentId={currentId}
            onChange={setCurrentId}
            onNew={handleNewDashboard}
          />
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Done
              </>
            ) : (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        </div>
      </div>

      <DashboardGrid
        widgets={widgets}
        isEditing={isEditing}
        onLayoutChange={handleLayoutChange}
        onRemoveWidget={handleRemoveWidget}
        onUpdateWidget={handleUpdateWidget}
      />

      {isEditing && <WidgetLibrary onAdd={handleAddWidget} />}
    </div>
  );
}
