import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/forms/SettingsForm";

export const metadata = {
  title: "Settings — Reelytics",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("workspace_members")
      .select("role, workspaces(id, name, plan)")
      .eq("user_id", user.id)
      .single(),
  ]);

  const workspace = membership?.workspaces ?? null;
  const role = membership?.role ?? "viewer";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and workspace settings
        </p>
      </div>

      <SettingsForm
        profile={{ ...profile, email: user.email }}
        workspace={workspace}
        role={role}
      />
    </div>
  );
}
