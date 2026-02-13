/**
 * Series Health Score Calculator
 *
 * Score = retention_consistency(30%) + paywall_conversion(25%) +
 *         hook_quality(20%) + engagement_trend(15%) +
 *         cliffhanger_effectiveness(10%)
 *
 * Each sub-score is 0-100, weighted and summed.
 *
 * @param {Object} params
 * @param {Array} params.episodes - Episodes with metrics aggregated
 * @param {number|null} params.paywallEpisode - Episode number where paywall starts
 * @returns {{ score: number, breakdown: Object }}
 */
export function calculateSeriesHealth({ episodes, paywallEpisode }) {
  if (!episodes || episodes.length === 0) {
    return { score: 0, breakdown: null };
  }

  const retention = calcRetentionConsistency(episodes);
  const paywall = calcPaywallConversion(episodes, paywallEpisode);
  const hooks = calcHookQuality(episodes);
  const trend = calcEngagementTrend(episodes);
  const cliffhangers = calcCliffhangerEffectiveness(episodes);

  const score = Math.round(
    retention * 0.3 +
    paywall * 0.25 +
    hooks * 0.2 +
    trend * 0.15 +
    cliffhangers * 0.1
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    breakdown: {
      retentionConsistency: Math.round(retention),
      paywallConversion: Math.round(paywall),
      hookQuality: Math.round(hooks),
      engagementTrend: Math.round(trend),
      cliffhangerEffectiveness: Math.round(cliffhangers),
    },
  };
}

/**
 * Retention consistency: how stable is avg_watch_pct across episodes?
 * Low variance = high score.
 */
function calcRetentionConsistency(episodes) {
  const retentions = episodes
    .map((e) => e.avg_watch_pct ?? e.avgWatchPct)
    .filter((v) => v != null && v > 0);

  if (retentions.length < 2) return 50;

  const mean = retentions.reduce((a, b) => a + b, 0) / retentions.length;
  const variance =
    retentions.reduce((sum, v) => sum + (v - mean) ** 2, 0) / retentions.length;
  const stdDev = Math.sqrt(variance);

  // coefficient of variation — lower is better
  const cv = mean > 0 ? stdDev / mean : 1;

  // CV of 0 = 100, CV of 0.5+ = 0
  const score = Math.max(0, 100 - cv * 200);

  // Also factor in the absolute retention level
  const levelBonus = Math.min(mean, 100) * 0.3;
  return Math.min(100, score * 0.7 + levelBonus);
}

/**
 * Paywall conversion: ratio of views after paywall vs before.
 */
function calcPaywallConversion(episodes, paywallEpisode) {
  if (!paywallEpisode) return 50; // No paywall set, neutral score

  const before = episodes.filter(
    (e) => (e.episode_number ?? e.episodeNumber) < paywallEpisode
  );
  const after = episodes.filter(
    (e) => (e.episode_number ?? e.episodeNumber) >= paywallEpisode
  );

  if (before.length === 0 || after.length === 0) return 50;

  const avgViewsBefore =
    before.reduce((s, e) => s + (e.total_views ?? e.views ?? 0), 0) /
    before.length;
  const avgViewsAfter =
    after.reduce((s, e) => s + (e.total_views ?? e.views ?? 0), 0) /
    after.length;

  if (avgViewsBefore === 0) return 50;

  const conversionRatio = avgViewsAfter / avgViewsBefore;
  // 50%+ conversion = 100, 0% = 0
  return Math.min(100, conversionRatio * 200);
}

/**
 * Hook quality: episodes with hooks that have high retention score better.
 */
function calcHookQuality(episodes) {
  const withHooks = episodes.filter(
    (e) =>
      (e.hook_timestamp_seconds ?? e.hookTimestamp) != null &&
      (e.avg_watch_pct ?? e.avgWatchPct) != null
  );

  if (withHooks.length === 0) return 50;

  const avgRetention =
    withHooks.reduce(
      (s, e) => s + (e.avg_watch_pct ?? e.avgWatchPct ?? 0),
      0
    ) / withHooks.length;

  // Also reward having hooks set on most episodes
  const hookCoverage = withHooks.length / episodes.length;

  return Math.min(100, avgRetention * 0.7 + hookCoverage * 100 * 0.3);
}

/**
 * Engagement trend: are views/retention improving over time?
 */
function calcEngagementTrend(episodes) {
  if (episodes.length < 3) return 50;

  const sorted = [...episodes].sort(
    (a, b) =>
      (a.episode_number ?? a.episodeNumber) -
      (b.episode_number ?? b.episodeNumber)
  );

  const half = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, half);
  const secondHalf = sorted.slice(half);

  const avgFirst =
    firstHalf.reduce(
      (s, e) => s + (e.avg_watch_pct ?? e.avgWatchPct ?? 0),
      0
    ) / firstHalf.length;
  const avgSecond =
    secondHalf.reduce(
      (s, e) => s + (e.avg_watch_pct ?? e.avgWatchPct ?? 0),
      0
    ) / secondHalf.length;

  if (avgFirst === 0) return 50;

  const change = (avgSecond - avgFirst) / avgFirst;
  // +20% improvement = 100, -20% decline = 0
  return Math.max(0, Math.min(100, 50 + change * 250));
}

/**
 * Cliffhanger effectiveness: episodes with cliffhangers should have high next-ep viewership.
 */
function calcCliffhangerEffectiveness(episodes) {
  const sorted = [...episodes].sort(
    (a, b) =>
      (a.episode_number ?? a.episodeNumber) -
      (b.episode_number ?? b.episodeNumber)
  );

  let cliffhangerScores = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const hasCliffhanger =
      (sorted[i].cliffhanger_timestamp_seconds ??
        sorted[i].cliffhangerTimestamp) != null;

    if (!hasCliffhanger) continue;

    const currentViews = sorted[i].total_views ?? sorted[i].views ?? 0;
    const nextViews = sorted[i + 1].total_views ?? sorted[i + 1].views ?? 0;

    if (currentViews > 0) {
      cliffhangerScores.push((nextViews / currentViews) * 100);
    }
  }

  if (cliffhangerScores.length === 0) return 50;

  const avg =
    cliffhangerScores.reduce((a, b) => a + b, 0) / cliffhangerScores.length;

  // 90%+ next-ep view = 100, <50% = 0
  return Math.max(0, Math.min(100, (avg - 50) * 2.5));
}

/**
 * Get the color for a health score.
 */
export function getHealthColor(score) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-warning";
  return "text-destructive";
}

/**
 * Get the background color class for a health score.
 */
export function getHealthBgColor(score) {
  if (score >= 80) return "stroke-success";
  if (score >= 60) return "stroke-primary";
  if (score >= 40) return "stroke-warning";
  return "stroke-destructive";
}
