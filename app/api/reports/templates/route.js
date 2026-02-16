import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    const { data: templates } = await supabase
      .from("report_templates")
      .select("*")
      .eq("workspace_id", membership.workspace_id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ templates: templates || [] });
  } catch (err) {
    console.error("Templates fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, type, config } = await request.json();
    if (!name || !type) {
      return NextResponse.json({ error: "Name and type required" }, { status: 400 });
    }

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    const { data, error } = await supabase
      .from("report_templates")
      .insert({
        workspace_id: membership.workspace_id,
        name,
        type,
        config: config || {},
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ template: data });
  } catch (err) {
    console.error("Template create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await request.json();
    if (!templateId) {
      return NextResponse.json({ error: "templateId required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("report_templates")
      .delete()
      .eq("id", templateId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Template delete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
