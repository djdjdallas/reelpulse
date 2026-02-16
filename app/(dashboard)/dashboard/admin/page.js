import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

const ADMIN_EMAIL = "dominickjerell@gmail.com";

export const metadata = {
  title: "Admin — Reelytics",
};

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.email !== ADMIN_EMAIL) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Analytics</h1>
        <p className="text-sm text-muted-foreground">
          PostHog analytics overview for your application
        </p>
      </div>
      <AdminDashboard />
    </div>
  );
}
