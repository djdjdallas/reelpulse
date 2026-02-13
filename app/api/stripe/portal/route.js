import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id, workspaces(stripe_customer_id)")
      .eq("user_id", user.id)
      .single();

    const customerId = membership?.workspaces?.stripe_customer_id;
    if (!customerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const session = await getStripeServer().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Portal error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
