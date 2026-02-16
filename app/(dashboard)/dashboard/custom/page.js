import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/utils/featureGating";
import { CustomDashboardClient } from "./CustomDashboardClient";

export const metadata = { title: "Custom Dashboard — Reelytics" };

export default async function CustomDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(plan)")
    .eq("user_id", user.id)
    .single();

  const plan = membership?.workspaces?.plan ?? "free";

  if (!hasFeature(plan, "hasCustomDashboard")) {
    redirect("/dashboard/settings/billing");
  }

  const { data: dashboards } = await supabase
    .from("dashboard_layouts")
    .select("*, dashboard_widgets(*)")
    .eq("user_id", user.id)
    .order("created_at");

  return <CustomDashboardClient initialDashboards={dashboards || []} />;
}
