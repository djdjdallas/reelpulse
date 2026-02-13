"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Zap, Film } from "lucide-react";

export function WeakEpisodeFlags({ weakEpisodes }) {
  if (!weakEpisodes || weakEpisodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Episode Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-success">
            All episodes are performing at or above average retention. Nice work!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Weak Episode Flags
          <Badge variant="outline" className="ml-auto">
            {weakEpisodes.length} flagged
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Episodes with below-average retention (avg: {weakEpisodes[0]?.avgRetention}%)
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {weakEpisodes.map((ep) => (
          <div
            key={ep.episode_number}
            className="rounded-lg border p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">
                  Ep {ep.episode_number}
                  {ep.title ? ` — ${ep.title}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="destructive"
                  className="text-xs"
                >
                  {ep.retention}% retention
                </Badge>
                <span className="text-xs text-destructive">
                  ({ep.gap}% below avg)
                </span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {!ep.hasHook && (
                <Badge variant="outline" className="text-xs text-warning border-warning/50">
                  No Hook
                </Badge>
              )}
              {!ep.hasCliffhanger && (
                <Badge variant="outline" className="text-xs text-warning border-warning/50">
                  No Cliffhanger
                </Badge>
              )}
            </div>

            <ul className="space-y-1">
              {ep.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
