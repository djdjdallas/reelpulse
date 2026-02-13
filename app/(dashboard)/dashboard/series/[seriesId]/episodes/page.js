import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EpisodeManager } from "@/components/forms/EpisodeManager";

export const metadata = {
  title: "Episodes — ReelPulse",
};

export default async function EpisodesPage({ params }) {
  const { seriesId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: series } = await supabase
    .from("series")
    .select("id, title")
    .eq("id", seriesId)
    .single();

  if (!series) notFound();

  const { data: episodes } = await supabase
    .from("episodes")
    .select("*")
    .eq("series_id", seriesId)
    .order("episode_number", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{series.title} — Episodes</h1>
      </div>
      <EpisodeManager seriesId={seriesId} initialEpisodes={episodes ?? []} />
    </div>
  );
}
