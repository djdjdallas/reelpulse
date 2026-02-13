import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MetricsPageClient } from "@/components/dashboard/MetricsPageClient";

export const metadata = {
  title: "Metrics — ReelPulse",
};

export default async function MetricsPage({ params }) {
  const { seriesId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: series } = await supabase
    .from("series")
    .select("*")
    .eq("id", seriesId)
    .single();

  if (!series) notFound();

  // Fetch episodes
  const { data: episodes } = await supabase
    .from("episodes")
    .select("*")
    .eq("series_id", seriesId)
    .order("episode_number", { ascending: true });

  // Fetch all metrics for episodes in this series
  const episodeIds = (episodes ?? []).map((e) => e.id);
  let metrics = [];

  if (episodeIds.length > 0) {
    const { data: metricsData } = await supabase
      .from("episode_metrics")
      .select("*")
      .in("episode_id", episodeIds)
      .order("date", { ascending: true });

    metrics = metricsData ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{series.title} — Metrics</h1>
        <p className="text-sm text-muted-foreground">
          Performance analytics, manual entry, and CSV upload
        </p>
      </div>
      <MetricsPageClient
        series={series}
        episodes={episodes ?? []}
        initialMetrics={metrics}
      />
    </div>
  );
}
