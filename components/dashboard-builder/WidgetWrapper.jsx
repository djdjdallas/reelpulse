"use client";

import { Button } from "@/components/ui/button";
import { GripVertical, Settings, X } from "lucide-react";

export function WidgetWrapper({ children, title, onRemove, onConfigure, isEditing }) {
  return (
    <div className="relative h-full">
      {isEditing && (
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between rounded-t-md bg-muted/80 px-2 py-1">
          <div className="flex items-center gap-1">
            <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
            <span className="text-xs font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            {onConfigure && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onConfigure}>
                <Settings className="h-3 w-3" />
              </Button>
            )}
            {onRemove && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={onRemove}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
      <div className={isEditing ? "pt-7" : ""}>{children}</div>
    </div>
  );
}
