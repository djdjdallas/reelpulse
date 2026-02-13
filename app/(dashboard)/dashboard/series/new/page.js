import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SeriesForm } from "@/components/forms/SeriesForm";

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
    .select("workspace_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Series</h1>
        <p className="text-sm text-muted-foreground">
          Set up a new micro-drama series to track
        </p>
      </div>
      <SeriesForm workspaceId={membership.workspace_id} />
    </div>
  );
}
