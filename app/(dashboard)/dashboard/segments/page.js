import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/utils/featureGating";
import { SegmentsPageClient } from "./SegmentsPageClient";

export const metadata = { title: "Segments — Reelytics" };

export default async function SegmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(plan)")
    .eq("user_id", user.id)
    .single();

  const plan = membership?.workspaces?.plan ?? "free";

  if (!hasFeature(plan, "hasSegmentation")) {
    redirect("/dashboard/settings/billing");
  }

  const { data: segments } = await supabase
    .from("audience_segments")
    .select("*")
    .eq("workspace_id", membership.workspace_id)
    .order("created_at", { ascending: false });

  const { data: analyses } = await supabase
    .from("segment_analysis")
    .select("*")
    .in("segment_id", (segments || []).map((s) => s.id).concat(["none"]));

  const { data: series } = await supabase
    .from("series")
    .select("id, title")
    .eq("workspace_id", membership.workspace_id)
    .order("title");

  return (
    <SegmentsPageClient
      segments={segments || []}
      analyses={analyses || []}
      series={series || []}
      hasAdvanced={hasFeature(plan, "hasAdvancedSegmentation")}
    />
  );
}
