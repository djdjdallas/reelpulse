/**
 * Normalize platform-specific metric differences for cross-platform comparison.
 */

/**
 * Normalize metrics to a comparable scale across platforms.
 * Different platforms have different audience sizes and engagement patterns.
 */
export function normalizeForComparison(metrics, platform) {
  const base = {
    views: metrics.total_views || 0,
    retention: metrics.avg_retention || 0,
    engagement: 0,
    revenue: metrics.total_revenue_cents || 0,
  };

  // Calculate engagement rate as (likes + comments + shares) / views
  const interactions = (metrics.total_likes || 0) + (metrics.total_comments || 0) + (metrics.total_shares || 0);
  base.engagement = base.views > 0 ? (interactions / base.views) * 100 : 0;

  return base;
}

/**
 * Calculate per-episode averages for a platform's metrics.
 */
export function perEpisodeAverages(metrics) {
  const count = metrics.episode_count || 1;
  return {
    avgViewsPerEpisode: Math.round((metrics.total_views || 0) / count),
    avgRetention: metrics.avg_retention || 0,
    avgRevenuePerEpisode: Math.round((metrics.total_revenue_cents || 0) / count),
    avgLikesPerEpisode: Math.round((metrics.total_likes || 0) / count),
  };
}
