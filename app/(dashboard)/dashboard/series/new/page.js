import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SeriesForm } from "@/components/forms/SeriesForm";
import { canCreateSeries } from "@/lib/utils/featureGating";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";

export const metadata = {
  title: "New Series — ReelPulse",
};

export default async function NewSeriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, plan)")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/login");

  const plan = membership.workspaces?.plan ?? "free";

  // Count existing series for this workspace
  const { count } = await supabase
    .from("series")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", membership.workspace_id);

  const canCreate = canCreateSeries(plan, count ?? 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Series</h1>
        <p className="text-sm text-muted-foreground">
          Set up a new micro-drama series to track
        </p>
      </div>
      {canCreate ? (
        <SeriesForm workspaceId={membership.workspace_id} />
      ) : (
        <UpgradeBanner message="You've reached your plan's series limit. Upgrade to create more series." />
      )}
    </div>
  );
}
