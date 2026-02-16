import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { evaluateAlerts } from "@/lib/notifications/evaluator";
import { sendEmail } from "@/lib/notifications/sender";
import { getEmailTemplate } from "@/lib/notifications/emailTemplates";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getServiceClient();
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Get all active series with their workspace owners
    const { data: seriesList } = await supabase
      .from("series")
      .select("id, title, workspace_id, workspaces!inner(plan)")
      .in("status", ["active", "draft"]);

    if (!seriesList?.length) {
      return NextResponse.json({ message: "No series to evaluate" });
    }

    let alertCount = 0;

    for (const series of seriesList) {
      // Skip free tier
      if (series.workspaces.plan === "free") continue;

      // Get today's and yesterday's snapshots
      const { data: todaySnap } = await supabase
        .from("metric_snapshots")
        .select("*")
        .eq("series_id", series.id)
        .eq("snapshot_date", today)
        .maybeSingle();

      const { data: yesterdaySnap } = await supabase
        .from("metric_snapshots")
        .select("*")
        .eq("series_id", series.id)
        .eq("snapshot_date", yesterday)
        .maybeSingle();

      if (!todaySnap || !yesterdaySnap) continue;

      // Get workspace members who have alert preferences
      const { data: members } = await supabase
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", series.workspace_id);

      if (!members?.length) continue;

      for (const member of members) {
        const { data: prefs } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", member.user_id)
          .maybeSingle();

        if (!prefs) continue;

        const alerts = evaluateAlerts({
          currentSnapshot: todaySnap,
          previousSnapshot: yesterdaySnap,
          preferences: prefs,
        });

        for (const alert of alerts) {
          // Create in-app notification
          if (prefs.in_app_enabled) {
            await supabase.from("notifications").insert({
              user_id: member.user_id,
              type: alert.type,
              title: alert.title,
              message: alert.message,
              metadata: { ...alert.metadata, series_title: series.title },
            });
          }

          // Send email notification
          if (prefs.email_enabled) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("id")
              .eq("id", member.user_id)
              .single();

            // Get user email from auth
            const { data: { user: authUser } } = await supabase.auth.admin.getUserById(member.user_id);

            if (authUser?.email) {
              const template = getEmailTemplate(alert.type, {
                seriesTitle: series.title,
                ...alert.metadata,
              });
              if (template) {
                await sendEmail({
                  to: authUser.email,
                  subject: template.subject,
                  html: template.html,
                }).catch((err) => console.error("Email error:", err));
              }
            }
          }

          alertCount++;
        }
      }
    }

    return NextResponse.json({ message: `Evaluated alerts. Generated ${alertCount} alerts.` });
  } catch (err) {
    console.error("Alert evaluation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
