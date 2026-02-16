import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    const { data: segments } = await supabase
      .from("audience_segments")
      .select("*")
      .eq("workspace_id", membership.workspace_id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ segments: segments || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, type, description, rules } = await request.json();
    if (!name || !type) return NextResponse.json({ error: "Name and type required" }, { status: 400 });

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    const { data, error } = await supabase
      .from("audience_segments")
      .insert({
        workspace_id: membership.workspace_id,
        name,
        type,
        description: description || null,
        rules: rules || {},
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ segment: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { segmentId } = await request.json();
    const { error } = await supabase
      .from("audience_segments")
      .delete()
      .eq("id", segmentId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
