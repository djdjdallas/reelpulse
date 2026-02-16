import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    return NextResponse.json({ preferences: prefs });
  } catch (err) {
    console.error("Preferences fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const prefs = {
      user_id: user.id,
      email_enabled: body.email_enabled ?? true,
      in_app_enabled: body.in_app_enabled ?? true,
      retention_drop_threshold: body.retention_drop_threshold ?? 15,
      health_score_dip_threshold: body.health_score_dip_threshold ?? 10,
      paywall_conversion_threshold: body.paywall_conversion_threshold ?? 5,
      weekly_digest: body.weekly_digest ?? true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert(prefs, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ preferences: data });
  } catch (err) {
    console.error("Preferences update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
