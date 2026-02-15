import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Pricing } from "@/components/marketing/Pricing";

export const metadata = {
  title: "Billing — Reelytics",
};

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name, plan, stripe_customer_id)")
    .eq("user_id", user.id)
    .single();

  const workspace = membership?.workspaces;
  const currentPlan = workspace?.plan || "free";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>
      <Pricing currentPlan={currentPlan} mode="billing" />
    </div>
  );
}
