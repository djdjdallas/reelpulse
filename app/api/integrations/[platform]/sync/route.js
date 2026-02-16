import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { decrypt, encrypt } from "@/lib/integrations/tokenEncryption";
import { getTikTokVideos, mapTikTokMetrics, refreshTikTokToken } from "@/lib/integrations/tiktok";
import { getYouTubeVideos, mapYouTubeMetrics, refreshYouTubeToken, getYouTubeChannelInfo } from "@/lib/integrations/youtube";

function getService() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request, { params }) {
  try {
    const { platform } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    }

    const { data: connection } = await supabase
      .from("platform_connections")
      .select("*")
      .eq("workspace_id", membership.workspace_id)
      .eq("platform", platform)
      .single();

    if (!connection) {
      return NextResponse.json({ error: "Platform not connected" }, { status: 404 });
    }

    const service = getService();

    // Create sync job
    const { data: job } = await service
      .from("sync_jobs")
      .insert({
        connection_id: connection.id,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    try {
      let accessToken = decrypt(connection.access_token_encrypted);

      // Refresh token if expired
      if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
        const refreshToken = connection.refresh_token_encrypted
          ? decrypt(connection.refresh_token_encrypted)
          : null;

        if (!refreshToken) throw new Error("Token expired and no refresh token available");

        let newTokens;
        if (platform === "tiktok") {
          newTokens = await refreshTikTokToken(refreshToken);
        } else {
          newTokens = await refreshYouTubeToken(refreshToken);
        }

        accessToken = newTokens.accessToken;

        await service
          .from("platform_connections")
          .update({
            access_token_encrypted: encrypt(newTokens.accessToken),
            refresh_token_encrypted: newTokens.refreshToken
              ? encrypt(newTokens.refreshToken)
              : connection.refresh_token_encrypted,
            token_expires_at: newTokens.expiresIn
              ? new Date(Date.now() + newTokens.expiresIn * 1000).toISOString()
              : connection.token_expires_at,
            updated_at: new Date().toISOString(),
          })
          .eq("id", connection.id);
      }

      // Get video mappings for this connection
      const { data: mappings } = await service
        .from("platform_video_mappings")
        .select("platform_video_id, episode_id")
        .eq("connection_id", connection.id)
        .not("episode_id", "is", null);

      let recordsSynced = 0;
      const today = new Date().toISOString().split("T")[0];

      if (platform === "tiktok") {
        const { videos } = await getTikTokVideos(accessToken);

        for (const video of videos) {
          const mapping = mappings?.find((m) => m.platform_video_id === video.id);
          if (!mapping) continue;

          const metrics = mapTikTokMetrics(video);

          await service
            .from("episode_metrics")
            .upsert(
              {
                episode_id: mapping.episode_id,
                date: today,
                views: metrics.views,
                likes: metrics.likes,
                comments: metrics.comments,
                shares: metrics.shares,
              },
              { onConflict: "episode_id,date" }
            );
          recordsSynced++;
        }
      }

      if (platform === "youtube") {
        const channelInfo = await getYouTubeChannelInfo(accessToken);
        if (channelInfo) {
          const { videos } = await getYouTubeVideos(accessToken, channelInfo.id);

          for (const video of videos) {
            const mapping = mappings?.find((m) => m.platform_video_id === video.id);
            if (!mapping) continue;

            const metrics = mapYouTubeMetrics(video.statistics);

            await service
              .from("episode_metrics")
              .upsert(
                {
                  episode_id: mapping.episode_id,
                  date: today,
                  views: metrics.views,
                  likes: metrics.likes,
                  comments: metrics.comments,
                  avg_percent_watched: metrics.avg_percent_watched,
                  watch_time_seconds: metrics.watch_time_seconds,
                  revenue_cents: metrics.revenue_cents,
                },
                { onConflict: "episode_id,date" }
              );
            recordsSynced++;
          }
        }
      }

      // Update job status
      await service.from("sync_jobs").update({
        status: "completed",
        records_synced: recordsSynced,
        completed_at: new Date().toISOString(),
      }).eq("id", job.id);

      // Update last synced
      await service.from("platform_connections").update({
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", connection.id);

      return NextResponse.json({ success: true, recordsSynced });
    } catch (syncError) {
      await service.from("sync_jobs").update({
        status: "failed",
        error_message: syncError.message,
        completed_at: new Date().toISOString(),
      }).eq("id", job.id);

      throw syncError;
    }
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: err.message || "Sync failed" }, { status: 500 });
  }
}
