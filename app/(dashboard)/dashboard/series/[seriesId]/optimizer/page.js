import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OptimizerClient } from "@/components/optimizer/OptimizerClient";
import { hasFeature } from "@/lib/utils/featureGating";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";

export const metadata = {
  title: "Paywall Optimizer — Reelytics",
};

export default async function OptimizerPage({ params }) {
  const { seriesId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: series } = await supabase
    .from("series")
    .select("*, workspaces(plan)")
    .eq("id", seriesId)
    .single();

  if (!series) notFound();

  const plan = series.workspaces?.plan ?? "free";

  if (!hasFeature(plan, "hasOptimizer")) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            {series.title} — Paywall Optimizer
          </h1>
          <p className="text-sm text-muted-foreground">
            Find the optimal paywall position and identify weak episodes
          </p>
        </div>
        <UpgradeBanner message="The Paywall Optimizer is available on Pro and Studio plans. Upgrade to unlock AI-powered paywall recommendations." />
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold">
          {series.title} — Paywall Optimizer
        </h1>
        <p className="text-sm text-muted-foreground">
          Find the optimal paywall position and identify weak episodes
        </p>
      </div>
      <OptimizerClient
        series={series}
        episodes={episodes ?? []}
        metrics={metrics}
      />
    </div>
  );
}
