import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/utils/featureGating";
import { ExperimentDashboard } from "@/components/experiments/ExperimentDashboard";
import { calculateExperimentResults } from "@/lib/calculations/statisticalSignificance";

export const metadata = { title: "Experiment — Reelytics" };

export default async function ExperimentDetailPage({ params }) {
  const { experimentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(plan)")
    .eq("user_id", user.id)
    .single();

  const plan = membership?.workspaces?.plan ?? "free";

  if (!hasFeature(plan, "hasABTesting")) {
    redirect("/dashboard/settings/billing");
  }

  const { data: experiment } = await supabase
    .from("experiments")
    .select("*")
    .eq("id", experimentId)
    .single();

  if (!experiment) redirect("/dashboard/experiments");

  const { data: variants } = await supabase
    .from("experiment_variants")
    .select("*")
    .eq("experiment_id", experimentId);

  const variantIds = (variants || []).map((v) => v.id);
  const { data: metrics } = await supabase
    .from("experiment_metrics")
    .select("*")
    .in("variant_id", variantIds.length ? variantIds : ["none"])
    .order("date");

  // Calculate results
  let results = null;
  const control = variants?.find((v) => v.is_control);
  const treatment = variants?.find((v) => !v.is_control);

  if (control && treatment && metrics?.length) {
    const controlMetrics = metrics.filter((m) => m.variant_id === control.id);
    const treatmentMetrics = metrics.filter((m) => m.variant_id === treatment.id);

    if (controlMetrics.length && treatmentMetrics.length) {
      results = calculateExperimentResults(
        controlMetrics,
        treatmentMetrics,
        experiment.success_metric
      );
    }
  }

  return (
    <ExperimentDashboard
      experiment={experiment}
      variants={variants || []}
      metrics={metrics || []}
      results={results}
    />
  );
}
