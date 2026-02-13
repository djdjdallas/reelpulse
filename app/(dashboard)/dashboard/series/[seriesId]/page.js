import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SeriesDetailTabs } from "@/components/dashboard/SeriesDetailTabs";

export async function generateMetadata({ params }) {
  const { seriesId } = await params;
  const supabase = await createClient();
  const { data: series } = await supabase
    .from("series")
    .select("title")
    .eq("id", seriesId)
    .single();

  return {
    title: series ? `${series.title} — ReelPulse` : "Series — ReelPulse",
  };
}

export default async function SeriesDetailPage({ params }) {
  const { seriesId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: series, error } = await supabase
    .from("series")
    .select("*")
    .eq("id", seriesId)
    .single();

  if (error || !series) notFound();

  // Fetch episodes for this series
  const { data: episodes } = await supabase
    .from("episodes")
    .select("*")
    .eq("series_id", seriesId)
    .order("episode_number", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{series.title}</h1>
        <p className="text-sm text-muted-foreground">
          {series.genre && `${series.genre} · `}
          {series.platform && `${series.platform} · `}
          {series.total_episodes || 0} episodes
        </p>
      </div>
      <SeriesDetailTabs
        series={series}
        episodes={episodes ?? []}
        seriesId={seriesId}
      />
    </div>
  );
}
