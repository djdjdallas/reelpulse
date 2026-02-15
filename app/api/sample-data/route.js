import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  SAMPLE_SERIES,
  SAMPLE_EPISODES,
  SAMPLE_METRICS,
} from "@/data/sample-billionaires-secret";
import { sampleDataLimiter, rateLimitHeaders } from "@/lib/utils/rateLimit";

export async function POST() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = sampleDataLimiter.check(user.id);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: rateLimitHeaders(3, 0, rateLimit.resetAt) }
      );
    }

    // Get user's workspace
    const { data: membership, error: memberError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    if (memberError || !membership) {
      return NextResponse.json(
        { error: "No workspace found" },
        { status: 400 }
      );
    }

    // Create the series
    const { data: series, error: seriesError } = await supabase
      .from("series")
      .insert({
        ...SAMPLE_SERIES,
        workspace_id: membership.workspace_id,
      })
      .select()
      .single();

    if (seriesError) {
      return NextResponse.json(
        { error: `Series creation failed: ${seriesError.message}` },
        { status: 500 }
      );
    }

    // Create episodes
    const episodeInserts = SAMPLE_EPISODES.map((ep) => ({
      ...ep,
      series_id: series.id,
    }));

    const { data: episodes, error: episodesError } = await supabase
      .from("episodes")
      .insert(episodeInserts)
      .select();

    if (episodesError) {
      return NextResponse.json(
        { error: `Episodes creation failed: ${episodesError.message}` },
        { status: 500 }
      );
    }

    // Map episode_number -> episode.id
    const epMap = {};
    for (const ep of episodes) {
      epMap[ep.episode_number] = ep.id;
    }

    // Create metrics
    const metricInserts = SAMPLE_METRICS.map((m) => ({
      episode_id: epMap[m.episode_number],
      date: m.date,
      views: m.views,
      watch_time_seconds: m.watch_time_seconds,
      avg_percent_watched: m.avg_percent_watched,
      drop_off_point_seconds: m.drop_off_point_seconds,
      likes: m.likes,
      shares: m.shares,
      comments: m.comments,
      unlocks: m.unlocks,
      revenue_cents: m.revenue_cents,
    }));

    const { error: metricsError } = await supabase
      .from("episode_metrics")
      .insert(metricInserts);

    if (metricsError) {
      return NextResponse.json(
        { error: `Metrics creation failed: ${metricsError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        seriesId: series.id,
        episodesCreated: episodes.length,
        metricsCreated: metricInserts.length,
      },
      { headers: rateLimitHeaders(3, rateLimit.remaining, rateLimit.resetAt) }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
