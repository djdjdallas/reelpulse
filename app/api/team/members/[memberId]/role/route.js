import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request, { params }) {
  try {
    const { memberId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await request.json();
    if (!role || !["editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Verify current user is owner
    const { data: currentMembership } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", user.id)
      .single();

    if (!currentMembership || currentMembership.role !== "owner") {
      return NextResponse.json({ error: "Only owners can change roles" }, { status: 403 });
    }

    // Verify target member is in same workspace and not an owner
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
      return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });
    }

    const { error } = await supabase
      .from("workspace_members")
      .update({ role })
      .eq("id", memberId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Role change error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
