import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/utils/featureGating";
import { IntegrationsPageClient } from "./IntegrationsPageClient";

export const metadata = { title: "Integrations — Reelytics" };

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(plan)")
    .eq("user_id", user.id)
    .single();

  const plan = membership?.workspaces?.plan ?? "free";

  if (!hasFeature(plan, "hasIntegrations")) {
    redirect("/dashboard/settings/billing");
  }

  const { data: connections } = await supabase
    .from("platform_connections")
    .select("*")
    .eq("workspace_id", membership.workspace_id);

  return (
    <IntegrationsPageClient connections={connections || []} />
  );
}
