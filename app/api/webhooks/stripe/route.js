import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Service role client — only place we bypass RLS
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = getStripeServer().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const workspaceId = session.metadata?.workspace_id;
        const plan = session.metadata?.plan;

        if (workspaceId && plan) {
          await supabase
            .from("workspaces")
            .update({
              plan,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              updated_at: new Date().toISOString(),
            })
            .eq("id", workspaceId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Determine plan from price ID
        let plan = "free";
        const priceId = subscription.items?.data?.[0]?.price?.id;
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "pro";
        else if (priceId === process.env.STRIPE_STUDIO_PRICE_ID) plan = "studio";

        if (subscription.status === "active") {
          await supabase
            .from("workspaces")
            .update({
              plan,
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        await supabase
          .from("workspaces")
          .update({
            plan: "free",
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
