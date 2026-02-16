import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/utils/featureGating";
import { CohortsPageClient } from "./CohortsPageClient";

export const metadata = { title: "Cohort Analysis — Reelytics" };

export default async function CohortsPage({ params }) {
  const { seriesId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(plan)")
    .eq("user_id", user.id)
    .single();

  const plan = membership?.workspaces?.plan ?? "free";

  if (!hasFeature(plan, "hasCohortAnalysis")) {
    redirect("/dashboard/settings/billing");
  }

  const { data: series } = await supabase
    .from("series")
    .select("*")
    .eq("id", seriesId)
    .single();

  if (!series) redirect("/dashboard/series");

  const { data: cohorts } = await supabase
    .from("cohorts")
    .select("*")
    .eq("series_id", seriesId)
    .order("date_from");

  // Get retention data
  const retentionData = [];
  for (const cohort of (cohorts || [])) {
    const { data: retention } = await supabase
      .from("cohort_retention")
      .select("*")
      .eq("cohort_id", cohort.id)
      .order("episode_number");

    retentionData.push({ cohortId: cohort.id, retention: retention || [] });
  }

  return (
    <CohortsPageClient
      seriesId={seriesId}
      series={series}
      cohorts={cohorts || []}
      retentionData={retentionData}
    />
  );
}
