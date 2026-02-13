"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EpisodeManager } from "@/components/forms/EpisodeManager";
import Link from "next/link";

export function SeriesDetailTabs({ series, episodes, seriesId }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="episodes">Episodes</TabsTrigger>
        <TabsTrigger value="metrics">
          <Link href={`/dashboard/series/${seriesId}/metrics`}>Metrics</Link>
        </TabsTrigger>
        <TabsTrigger value="optimizer">
          <Link href={`/dashboard/series/${seriesId}/optimizer`}>
            Optimizer
          </Link>
        </TabsTrigger>
        <TabsTrigger value="settings">
          <Link href={`/dashboard/series/${seriesId}/settings`}>Settings</Link>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 mt-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Series Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Genre" value={series.genre} />
              <InfoRow label="Platform" value={series.platform} />
              <InfoRow
                label="Total Episodes"
                value={series.total_episodes || "—"}
              />
              <InfoRow
                label="Paywall Episode"
                value={series.paywall_episode || "—"}
              />
              <InfoRow label="Target Audience" value={series.target_audience} />
              <InfoRow
                label="Status"
                value={
                  <Badge variant="secondary" className="capitalize">
                    {series.status}
                  </Badge>
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {series.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Episodes ({episodes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {episodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No episodes yet. Switch to the Episodes tab to add some.
              </p>
            ) : (
              <div className="space-y-2">
                {episodes.slice(0, 5).map((ep) => (
                  <div
                    key={ep.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span>
                      Ep {ep.episode_number}
                      {ep.title ? ` — ${ep.title}` : ""}
                    </span>
                    <Badge variant={ep.is_free ? "secondary" : "default"}>
                      {ep.is_free ? "Free" : "Paid"}
                    </Badge>
                  </div>
                ))}
                {episodes.length > 5 && (
                  <p className="text-xs text-muted-foreground pt-1">
                    + {episodes.length - 5} more episodes
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="episodes" className="mt-4">
        <EpisodeManager seriesId={seriesId} initialEpisodes={episodes} />
      </TabsContent>
    </Tabs>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
