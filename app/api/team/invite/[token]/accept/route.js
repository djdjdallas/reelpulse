import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request, { params }) {
  try {
    const { token } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in to accept this invite" }, { status: 401 });
    }

    // Find the invite
    const { data: invite } = await supabase
      .from("workspace_invites")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (!invite) {
      return NextResponse.json({ error: "Invite not found or expired" }, { status: 404 });
    }

    // Check expiration
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from("workspace_invites")
        .update({ status: "expired" })
        .eq("id", invite.id);
      return NextResponse.json({ error: "This invite has expired" }, { status: 410 });
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", invite.workspace_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      // Mark invite as accepted anyway
      await supabase
        .from("workspace_invites")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", invite.id);
      return NextResponse.json({ success: true, already_member: true });
    }

    // Use service role to add member (bypasses RLS)
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Add as workspace member
    const { error: memberError } = await serviceClient
      .from("workspace_members")
      .insert({
        workspace_id: invite.workspace_id,
        user_id: user.id,
        role: invite.role,
      });

    if (memberError) throw memberError;

    // Mark invite as accepted
    await serviceClient
      .from("workspace_invites")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", invite.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Accept invite error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
