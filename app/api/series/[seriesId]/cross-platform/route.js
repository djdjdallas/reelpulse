import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request, { params }) {
  try {
    const { seriesId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get platform links
    const { data: links } = await supabase
      .from("platform_links")
      .select("*")
      .eq("series_id", seriesId);

    if (!links?.length) {
      return NextResponse.json({ platforms: [] });
    }

    // Get episode metrics grouped by series
    const { data: episodes } = await supabase
      .from("episodes")
      .select("id")
      .eq("series_id", seriesId);

    const episodeIds = (episodes || []).map((e) => e.id);

    if (!episodeIds.length) {
      return NextResponse.json({
        platforms: links.map((l) => ({
          platform: l.platform,
          title_on_platform: l.title_on_platform,
          total_views: 0,
          avg_retention: 0,
          total_likes: 0,
          total_shares: 0,
          total_comments: 0,
          total_revenue_cents: 0,
          episode_count: 0,
        })),
      });
    }

    // Aggregate metrics for this series
    const { data: metrics } = await supabase
      .from("episode_metrics")
      .select("views, avg_percent_watched, likes, shares, comments, revenue_cents")
      .in("episode_id", episodeIds);

    const aggregated = (metrics || []).reduce(
      (acc, m) => ({
        total_views: acc.total_views + (m.views || 0),
        avg_retention_sum: acc.avg_retention_sum + (m.avg_percent_watched || 0),
        avg_retention_count: acc.avg_retention_count + (m.avg_percent_watched ? 1 : 0),
        total_likes: acc.total_likes + (m.likes || 0),
        total_shares: acc.total_shares + (m.shares || 0),
        total_comments: acc.total_comments + (m.comments || 0),
        total_revenue_cents: acc.total_revenue_cents + (m.revenue_cents || 0),
      }),
      { total_views: 0, avg_retention_sum: 0, avg_retention_count: 0, total_likes: 0, total_shares: 0, total_comments: 0, total_revenue_cents: 0 }
    );

    // For now, share same metrics across platforms since we don't have per-platform episode data
    const platforms = links.map((l) => ({
      platform: l.platform,
      title_on_platform: l.title_on_platform,
      total_views: aggregated.total_views,
      avg_retention: aggregated.avg_retention_count > 0
        ? aggregated.avg_retention_sum / aggregated.avg_retention_count
        : 0,
      total_likes: aggregated.total_likes,
      total_shares: aggregated.total_shares,
      total_comments: aggregated.total_comments,
      total_revenue_cents: aggregated.total_revenue_cents,
      episode_count: episodeIds.length,
    }));

    return NextResponse.json({ platforms });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
