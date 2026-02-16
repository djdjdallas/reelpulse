import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/utils/featureGating";
import { ExperimentBuilder } from "@/components/experiments/ExperimentBuilder";

export const metadata = { title: "New Experiment — Reelytics" };

export default async function NewExperimentPage() {
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

  const { data: series } = await supabase
    .from("series")
    .select("id, title")
    .eq("workspace_id", membership.workspace_id)
    .order("title");

  return <ExperimentBuilder series={series || []} />;
}
