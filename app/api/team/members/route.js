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

    if (!membership) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    }

    const { data: members } = await supabase
      .from("workspace_members")
      .select("id, user_id, role, created_at, profiles(id, full_name, avatar_url)")
      .eq("workspace_id", membership.workspace_id)
      .order("created_at");

    return NextResponse.json({ members: members || [] });
  } catch (err) {
    console.error("List members error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberId } = await request.json();
    if (!memberId) {
      return NextResponse.json({ error: "memberId required" }, { status: 400 });
    }

    // Verify the current user is an owner
    const { data: currentMembership } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", user.id)
      .single();

    if (!currentMembership || currentMembership.role !== "owner") {
      return NextResponse.json({ error: "Only owners can remove members" }, { status: 403 });
    }

    // Verify target member is in the same workspace and not an owner
    const { data: target } = await supabase
      .from("workspace_members")
      .select("id, role")
      .eq("id", memberId)
      .eq("workspace_id", currentMembership.workspace_id)
      .single();

    if (!target) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (target.role === "owner") {
      return NextResponse.json({ error: "Cannot remove workspace owner" }, { status: 400 });
    }

    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("id", memberId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Remove member error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
