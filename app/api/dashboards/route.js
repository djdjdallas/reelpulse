import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: dashboards } = await supabase
      .from("dashboard_layouts")
      .select("*, dashboard_widgets(*)")
      .eq("user_id", user.id)
      .order("created_at");

    return NextResponse.json({ dashboards: dashboards || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await request.json();

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    const { data, error } = await supabase
      .from("dashboard_layouts")
      .insert({
        workspace_id: membership.workspace_id,
        user_id: user.id,
        name: name || "My Dashboard",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ dashboard: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
