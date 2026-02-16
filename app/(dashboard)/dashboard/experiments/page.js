import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/utils/featureGating";
import { Button } from "@/components/ui/button";
import { ExperimentList } from "@/components/experiments/ExperimentList";
import { Plus } from "lucide-react";

export const metadata = { title: "Experiments — Reelytics" };

export default async function ExperimentsPage() {
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

  const { data: experiments } = await supabase
    .from("experiments")
    .select("*")
    .eq("workspace_id", membership.workspace_id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Experiments</h1>
          <p className="text-sm text-muted-foreground">
            Run A/B tests to optimize your series performance.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/experiments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Experiment
          </Link>
        </Button>
      </div>

      <ExperimentList experiments={experiments || []} />
    </div>
  );
}
