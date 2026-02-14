import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SeriesCard } from "@/components/dashboard/SeriesCard";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { canCreateSeries, getPlanLimits } from "@/lib/utils/featureGating";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user's workspace with plan
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name, plan)")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/login");

  const plan = membership.workspaces?.plan ?? "free";
  const limits = getPlanLimits(plan);

  // Fetch all series for this workspace
  const { data: seriesList } = await supabase
    .from("series")
    .select("*")
    .eq("workspace_id", membership.workspace_id)
    .order("updated_at", { ascending: false });

  const series = seriesList ?? [];
  const canCreate = canCreateSeries(plan, series.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage your micro-drama series
            {limits.maxSeries !== Infinity && (
              <span className="ml-1">
                ({series.length}/{limits.maxSeries} series)
              </span>
            )}
          </p>
        </div>
        {canCreate ? (
          <Button asChild>
            <Link href="/dashboard/series/new">
              <Plus className="mr-2 h-4 w-4" />
              New Series
            </Link>
          </Button>
        ) : (
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Series
          </Button>
        )}
      </div>

      {series.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      )}
    </div>
  );
}
