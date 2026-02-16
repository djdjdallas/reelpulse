"use client";

import { useState, useCallback, useRef } from "react";
import { Responsive, useContainerWidth } from "react-grid-layout";
import { WidgetWrapper } from "./WidgetWrapper";
import { WidgetConfigDialog } from "./WidgetConfigDialog";
import { MetricCardWidget } from "./widgets/MetricCardWidget";
import { ChartWidget } from "./widgets/ChartWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "react-grid-layout/css/styles.css";

function renderWidget(widget) {
  switch (widget.widget_type) {
    case "metric_card":
      return <MetricCardWidget config={widget.config} />;
    case "revenue_trend":
      return <ChartWidget title={widget.title} widgetType="revenue_trend" config={widget.config} />;
    case "engagement_trend":
      return <ChartWidget title={widget.title} widgetType="engagement_trend" config={widget.config} />;
    case "experiment_status":
      return <ChartWidget title={widget.title} widgetType="experiment_status" config={widget.config} />;
    default:
      return (
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{widget.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center text-sm text-muted-foreground">
            Configure a series to view this widget
          </CardContent>
        </Card>
      );
  }
}

export function DashboardGrid({ widgets, isEditing, onLayoutChange, onRemoveWidget, onUpdateWidget }) {
  const containerRef = useRef(null);
  const width = useContainerWidth(containerRef);
  const [configWidget, setConfigWidget] = useState(null);

  const layout = widgets.map((w) => ({
    i: w.id,
    x: w.position?.x ?? 0,
    y: w.position?.y ?? 0,
    w: w.position?.w ?? 6,
    h: w.position?.h ?? 4,
    minW: 2,
    minH: 2,
  }));

  const handleLayoutChange = useCallback(
    (newLayout) => {
      if (!isEditing) return;
      const updates = newLayout.map((item) => ({
        id: item.i,
        position: { x: item.x, y: item.y, w: item.w, h: item.h },
      }));
      onLayoutChange?.(updates);
    },
    [isEditing, onLayoutChange]
  );

  if (!widgets.length) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          {isEditing
            ? "Add widgets from the library below."
            : "No widgets yet. Click Edit to start building your dashboard."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef}>
        {width > 0 && (
          <Responsive
            className="layout"
            width={width}
            layouts={{ lg: layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
            rowHeight={60}
            isDraggable={isEditing}
            isResizable={isEditing}
            onLayoutChange={handleLayoutChange}
            compactType="vertical"
            margin={[16, 16]}
          >
            {widgets.map((widget) => (
              <div key={widget.id}>
                <WidgetWrapper
                  title={widget.title}
                  isEditing={isEditing}
                  onRemove={() => onRemoveWidget?.(widget.id)}
                  onConfigure={() => setConfigWidget(widget)}
                >
                  {renderWidget(widget)}
                </WidgetWrapper>
              </div>
            ))}
          </Responsive>
        )}
      </div>

      {configWidget && (
        <WidgetConfigDialog
          widget={configWidget}
          open={!!configWidget}
          onClose={() => setConfigWidget(null)}
          onSave={(updated) => {
            onUpdateWidget?.(updated);
            setConfigWidget(null);
          }}
        />
      )}
    </>
  );
}
