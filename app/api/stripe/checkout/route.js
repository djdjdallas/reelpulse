import { NextResponse } from "next/server";
import { getStripeServer, PLANS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { checkoutLimiter, rateLimitHeaders } from "@/lib/utils/rateLimit";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = checkoutLimiter.check(user.id);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: rateLimitHeaders(5, 0, rateLimit.resetAt) }
      );
    }

    const { plan } = await request.json();

    if (!plan || !PLANS[plan]) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const priceId = PLANS[plan].priceId;
    if (!priceId) {
      return NextResponse.json(
        { error: "No price configured for this plan" },
        { status: 400 }
      );
    }

    // Get workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id, workspaces(id, stripe_customer_id)")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "No workspace found" },
        { status: 400 }
      );
    }

    const workspace = membership.workspaces;

    // Create or reuse Stripe customer
    let customerId = workspace.stripe_customer_id;
    if (!customerId) {
      const customer = await getStripeServer().customers.create({
        email: user.email,
        metadata: { workspace_id: workspace.id, user_id: user.id },
      });
      customerId = customer.id;
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const session = await getStripeServer().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/settings/billing?success=true`,
      cancel_url: `${origin}/dashboard/settings/billing?canceled=true`,
      metadata: {
        workspace_id: workspace.id,
        plan,
      },
    });

    return NextResponse.json(
      { url: session.url },
      { headers: rateLimitHeaders(5, rateLimit.remaining, rateLimit.resetAt) }
    );
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
