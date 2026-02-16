import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/utils/featureGating";
import { TeamPageClient } from "./TeamPageClient";

export const metadata = { title: "Team — Reelytics" };

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, plan)")
    .eq("user_id", user.id)
    .single();

  const plan = membership?.workspaces?.plan ?? "free";

  if (!hasFeature(plan, "hasTeamCollaboration")) {
    redirect("/dashboard/settings/billing");
  }

  const { data: members } = await supabase
    .from("workspace_members")
    .select("id, user_id, role, created_at, profiles(id, full_name, avatar_url)")
    .eq("workspace_id", membership.workspace_id)
    .order("created_at");

  const { data: invites } = await supabase
    .from("workspace_invites")
    .select("*")
    .eq("workspace_id", membership.workspace_id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <TeamPageClient
      members={members || []}
      invites={invites || []}
      currentUserId={user.id}
      isOwner={membership.role === "owner"}
    />
  );
}
