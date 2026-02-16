import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role } = await request.json();
    if (!email || !role || !["editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid email or role" }, { status: 400 });
    }

    // Get workspace where user is owner
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces(id, plan)")
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "owner") {
      return NextResponse.json({ error: "Only workspace owners can invite members" }, { status: 403 });
    }

    if (membership.workspaces.plan !== "studio") {
      return NextResponse.json({ error: "Team collaboration requires a Studio plan" }, { status: 403 });
    }

    // Check current member count
    const { count: memberCount } = await supabase
      .from("workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", membership.workspace_id);

    const { count: pendingCount } = await supabase
      .from("workspace_invites")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", membership.workspace_id)
      .eq("status", "pending");

    if ((memberCount || 0) + (pendingCount || 0) >= 25) {
      return NextResponse.json({ error: "Maximum team size reached (25)" }, { status: 400 });
    }

    // Check for existing pending invite
    const { data: existing } = await supabase
      .from("workspace_invites")
      .select("id")
      .eq("workspace_id", membership.workspace_id)
      .eq("email", email.toLowerCase())
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "An invite is already pending for this email" }, { status: 400 });
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("workspace_members")
      .select("id, profiles!inner(id)")
      .eq("workspace_id", membership.workspace_id)
      .maybeSingle();

    const token = randomBytes(32).toString("hex");

    const { data: invite, error } = await supabase
      .from("workspace_invites")
      .insert({
        workspace_id: membership.workspace_id,
        email: email.toLowerCase(),
        role,
        token,
        invited_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Send invite email via Resend if configured
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      await resend.emails.send({
        from: process.env.NOTIFICATION_FROM_EMAIL || "noreply@reelytics.app",
        to: email.toLowerCase(),
        subject: "You've been invited to join a Reelytics workspace",
        html: `
          <h2>You've been invited!</h2>
          <p>You've been invited to join a workspace on Reelytics as a <strong>${role}</strong>.</p>
          <p><a href="${appUrl}/invite/${token}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;">Accept Invite</a></p>
          <p>This invite expires in 7 days.</p>
        `,
      });
    }

    return NextResponse.json({ invite });
  } catch (err) {
    console.error("Invite error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inviteId, action } = await request.json();
    if (!inviteId || !["resend", "revoke"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Verify ownership
    const { data: invite } = await supabase
      .from("workspace_invites")
      .select("*, workspaces!inner(id)")
      .eq("id", inviteId)
      .eq("status", "pending")
      .single();

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", invite.workspace_id)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "owner") {
      return NextResponse.json({ error: "Only owners can manage invites" }, { status: 403 });
    }

    if (action === "revoke") {
      await supabase
        .from("workspace_invites")
        .update({ status: "revoked", updated_at: new Date().toISOString() })
        .eq("id", inviteId);
      return NextResponse.json({ success: true });
    }

    if (action === "resend") {
      const newToken = randomBytes(32).toString("hex");
      await supabase
        .from("workspace_invites")
        .update({
          token: newToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", inviteId);

      if (process.env.RESEND_API_KEY) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        await resend.emails.send({
          from: process.env.NOTIFICATION_FROM_EMAIL || "noreply@reelytics.app",
          to: invite.email,
          subject: "Reminder: You've been invited to join a Reelytics workspace",
          html: `
            <h2>You've been invited!</h2>
            <p>This is a reminder that you've been invited to join a workspace on Reelytics as a <strong>${invite.role}</strong>.</p>
            <p><a href="${appUrl}/invite/${newToken}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;">Accept Invite</a></p>
            <p>This invite expires in 7 days.</p>
          `,
        });
      }

      return NextResponse.json({ success: true });
    }
  } catch (err) {
    console.error("Invite action error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
