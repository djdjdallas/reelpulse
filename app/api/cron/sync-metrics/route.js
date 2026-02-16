import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decrypt, encrypt } from "@/lib/integrations/tokenEncryption";
import { getTikTokVideos, mapTikTokMetrics, refreshTikTokToken } from "@/lib/integrations/tiktok";
import { getYouTubeVideos, getYouTubeChannelInfo, mapYouTubeMetrics, refreshYouTubeToken } from "@/lib/integrations/youtube";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getServiceClient();

    // Get all active connections
    const { data: connections } = await supabase
      .from("platform_connections")
      .select("*, workspaces!inner(plan)")
      .eq("status", "active");

    if (!connections?.length) {
      return NextResponse.json({ message: "No active connections" });
    }

    let totalSynced = 0;
    let errors = 0;

    for (const conn of connections) {
      if (conn.workspaces.plan === "free") continue;

      try {
        let accessToken = decrypt(conn.access_token_encrypted);

        // Refresh token if needed
        if (conn.token_expires_at && new Date(conn.token_expires_at) < new Date()) {
          const refreshToken = conn.refresh_token_encrypted
            ? decrypt(conn.refresh_token_encrypted)
            : null;
          if (!refreshToken) {
            await supabase.from("platform_connections")
              .update({ status: "expired", updated_at: new Date().toISOString() })
              .eq("id", conn.id);
            continue;
          }

          let newTokens;
          if (conn.platform === "tiktok") {
            newTokens = await refreshTikTokToken(refreshToken);
          } else {
            newTokens = await refreshYouTubeToken(refreshToken);
          }
          accessToken = newTokens.accessToken;

          await supabase.from("platform_connections").update({
            access_token_encrypted: encrypt(newTokens.accessToken),
            refresh_token_encrypted: newTokens.refreshToken ? encrypt(newTokens.refreshToken) : conn.refresh_token_encrypted,
            token_expires_at: newTokens.expiresIn ? new Date(Date.now() + newTokens.expiresIn * 1000).toISOString() : conn.token_expires_at,
            updated_at: new Date().toISOString(),
          }).eq("id", conn.id);
        }

        // Create sync job
        const { data: job } = await supabase
          .from("sync_jobs")
          .insert({ connection_id: conn.id, status: "running", started_at: new Date().toISOString() })
          .select()
          .single();

        const { data: mappings } = await supabase
          .from("platform_video_mappings")
          .select("platform_video_id, episode_id")
          .eq("connection_id", conn.id)
          .not("episode_id", "is", null);

        let recordsSynced = 0;
        const today = new Date().toISOString().split("T")[0];

        if (conn.platform === "tiktok") {
          const { videos } = await getTikTokVideos(accessToken);
          for (const video of videos) {
            const mapping = mappings?.find((m) => m.platform_video_id === video.id);
            if (!mapping) continue;
            const metrics = mapTikTokMetrics(video);
            await supabase.from("episode_metrics").upsert({
              episode_id: mapping.episode_id, date: today,
              views: metrics.views, likes: metrics.likes,
              comments: metrics.comments, shares: metrics.shares,
            }, { onConflict: "episode_id,date" });
            recordsSynced++;
          }
        }

        if (conn.platform === "youtube") {
          const channelInfo = await getYouTubeChannelInfo(accessToken);
          if (channelInfo) {
            const { videos } = await getYouTubeVideos(accessToken, channelInfo.id);
            for (const video of videos) {
              const mapping = mappings?.find((m) => m.platform_video_id === video.id);
              if (!mapping) continue;
              const metrics = mapYouTubeMetrics(video.statistics);
              await supabase.from("episode_metrics").upsert({
                episode_id: mapping.episode_id, date: today,
                views: metrics.views, likes: metrics.likes,
                comments: metrics.comments,
                avg_percent_watched: metrics.avg_percent_watched,
                watch_time_seconds: metrics.watch_time_seconds,
                revenue_cents: metrics.revenue_cents,
              }, { onConflict: "episode_id,date" });
              recordsSynced++;
            }
          }
        }

        await supabase.from("sync_jobs").update({
          status: "completed", records_synced: recordsSynced, completed_at: new Date().toISOString(),
        }).eq("id", job.id);

        await supabase.from("platform_connections").update({
          last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }).eq("id", conn.id);

        totalSynced += recordsSynced;
      } catch (connError) {
        console.error(`Sync error for connection ${conn.id}:`, connError);
        errors++;
        await supabase.from("platform_connections").update({
          status: "error", updated_at: new Date().toISOString(),
        }).eq("id", conn.id);
      }
    }

    return NextResponse.json({
      message: `Sync complete. ${totalSynced} records synced. ${errors} errors.`,
    });
  } catch (err) {
    console.error("Cron sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
