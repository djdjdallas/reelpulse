import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch workspace for current user
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, name, plan)")
    .eq("user_id", user.id)
    .single();

  const workspace = membership?.workspaces ?? null;

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <Sidebar user={user} />
        <main className="flex-1 overflow-y-auto pt-14 md:ml-60 md:pt-0">
          <div className="mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>
    </TooltipProvider>
  );
}
