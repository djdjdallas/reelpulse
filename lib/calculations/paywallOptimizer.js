/**
 * Paywall Optimizer
 *
 * For each candidate position (episode 2 through N-1):
 *   score = cliffhanger_strength * retention * next_episode_demand
 *
 * Returns the best position with reasoning text.
 */

/**
 * Analyze current paywall placement.
 *
 * @param {Array} episodes - enriched episodes with metrics
 * @param {number} currentPaywall - current paywall episode number
 * @returns {{ dropOffPct: number, conversionRate: number, viewsBeforePaywall: number, viewsAfterPaywall: number }}
 */
export function analyzeCurrentPaywall(episodes, currentPaywall) {
  if (!currentPaywall || episodes.length < 2) {
    return { dropOffPct: 0, conversionRate: 0, viewsBeforePaywall: 0, viewsAfterPaywall: 0 };
  }

  const sorted = [...episodes].sort(
    (a, b) => (a.episode_number ?? a.episodeNumber) - (b.episode_number ?? b.episodeNumber)
  );

  const preEp = sorted.find(
    (e) => (e.episode_number ?? e.episodeNumber) === currentPaywall - 1
  );
  const postEp = sorted.find(
    (e) => (e.episode_number ?? e.episodeNumber) === currentPaywall
  );

  const viewsBefore = preEp?.totalViews ?? preEp?.total_views ?? preEp?.views ?? 0;
  const viewsAfter = postEp?.totalViews ?? postEp?.total_views ?? postEp?.views ?? 0;

  const dropOffPct = viewsBefore > 0
    ? ((viewsBefore - viewsAfter) / viewsBefore) * 100
    : 0;

  const conversionRate = viewsBefore > 0
    ? (viewsAfter / viewsBefore) * 100
    : 0;

  const before = sorted.filter(
    (e) => (e.episode_number ?? e.episodeNumber) < currentPaywall
  );
  const after = sorted.filter(
    (e) => (e.episode_number ?? e.episodeNumber) >= currentPaywall
  );

  const totalViewsBefore = before.reduce(
    (s, e) => s + (e.totalViews ?? e.total_views ?? e.views ?? 0), 0
  );
  const totalViewsAfter = after.reduce(
    (s, e) => s + (e.totalViews ?? e.total_views ?? e.views ?? 0), 0
  );

  return {
    dropOffPct,
    conversionRate,
    viewsBeforePaywall: totalViewsBefore,
    viewsAfterPaywall: totalViewsAfter,
  };
}

/**
 * Find the optimal paywall position.
 *
 * @param {Array} episodes - enriched episodes with metrics
 * @returns {{ position: number, score: number, reasoning: string, allScores: Array, estimatedImprovement: number }}
 */
export function findOptimalPaywall(episodes) {
  if (episodes.length < 3) {
    return {
      position: null,
      score: 0,
      reasoning: "Need at least 3 episodes to recommend a paywall position.",
      allScores: [],
      estimatedImprovement: 0,
    };
  }

  const sorted = [...episodes].sort(
    (a, b) => (a.episode_number ?? a.episodeNumber) - (b.episode_number ?? b.episodeNumber)
  );

  const allScores = [];

  for (let i = 1; i < sorted.length - 1; i++) {
    const ep = sorted[i];
    const nextEp = sorted[i + 1];
    const epNum = ep.episode_number ?? ep.episodeNumber;

    // Cliffhanger strength: does this episode have a cliffhanger? how late is it?
    const hasCH = (ep.cliffhanger_timestamp_seconds ?? ep.cliffhangerTimestamp) != null;
    const duration = ep.duration_seconds ?? 90;
    const chTime = ep.cliffhanger_timestamp_seconds ?? ep.cliffhangerTimestamp ?? 0;
    const cliffhangerStrength = hasCH
      ? 0.5 + 0.5 * (chTime / duration) // later cliffhanger = stronger
      : 0.3; // no cliffhanger, weak

    // Retention at this episode
    const retention = (ep.avg_watch_pct ?? ep.avgWatchPct ?? 50) / 100;

    // Next episode demand: how many viewers continue?
    const currentViews = ep.totalViews ?? ep.total_views ?? ep.views ?? 0;
    const nextViews = nextEp.totalViews ?? nextEp.total_views ?? nextEp.views ?? 0;
    const nextEpDemand = currentViews > 0
      ? Math.min(nextViews / currentViews, 1)
      : 0.5;

    const score = cliffhangerStrength * retention * nextEpDemand * 100;

    allScores.push({
      episode: epNum,
      score: Math.round(score * 10) / 10,
      cliffhangerStrength: Math.round(cliffhangerStrength * 100),
      retention: Math.round(retention * 100),
      nextEpDemand: Math.round(nextEpDemand * 100),
    });
  }

  // Find the best score
  const best = allScores.reduce(
    (max, s) => (s.score > max.score ? s : max),
    allScores[0]
  );

  const reasoning = buildReasoning(best, sorted);

  return {
    position: best.episode + 1, // paywall goes AFTER this episode
    score: best.score,
    reasoning,
    allScores,
    estimatedImprovement: 0, // calculated when comparing to current
  };
}

function buildReasoning(best, sorted) {
  const ep = sorted.find(
    (e) => (e.episode_number ?? e.episodeNumber) === best.episode
  );
  const title = ep?.title ? ` ("${ep.title}")` : "";

  const parts = [];
  parts.push(
    `Episode ${best.episode}${title} is the strongest paywall lead-in.`
  );

  if (best.cliffhangerStrength >= 70) {
    parts.push("It has a strong late-episode cliffhanger that creates urgency.");
  } else if (best.cliffhangerStrength >= 50) {
    parts.push("It has a moderate cliffhanger to drive conversions.");
  }

  if (best.retention >= 80) {
    parts.push(`High retention (${best.retention}%) means viewers are engaged.`);
  }

  if (best.nextEpDemand >= 80) {
    parts.push(
      `${best.nextEpDemand}% of viewers continue to the next episode — strong demand.`
    );
  }

  parts.push(
    `Placing the paywall at episode ${best.episode + 1} maximizes the cliffhanger-to-conversion funnel.`
  );

  return parts.join(" ");
}

/**
 * Estimate metrics at a given paywall position using existing data.
 *
 * @param {Array} episodes - enriched episodes
 * @param {number} position - candidate paywall episode number
 * @returns {{ estimatedViews: number, estimatedConversion: number, estimatedRevenue: number }}
 */
export function estimateAtPosition(episodes, position) {
  const sorted = [...episodes].sort(
    (a, b) => (a.episode_number ?? a.episodeNumber) - (b.episode_number ?? b.episodeNumber)
  );

  const preEp = sorted.find(
    (e) => (e.episode_number ?? e.episodeNumber) === position - 1
  );
  const postEp = sorted.find(
    (e) => (e.episode_number ?? e.episodeNumber) === position
  );

  if (!preEp) {
    return { estimatedViews: 0, estimatedConversion: 0, estimatedRevenue: 0 };
  }

  const preViews = preEp.totalViews ?? preEp.total_views ?? preEp.views ?? 0;
  const hasCH = (preEp.cliffhanger_timestamp_seconds ?? preEp.cliffhangerTimestamp) != null;
  const retention = (preEp.avg_watch_pct ?? preEp.avgWatchPct ?? 50) / 100;

  // Estimate conversion based on cliffhanger + retention
  const baseConversion = hasCH ? 0.45 : 0.30;
  const estimatedConversion = Math.min(baseConversion * retention * 1.5, 0.85);
  const estimatedViews = Math.round(preViews * estimatedConversion);

  // Estimate revenue: paid eps × estimated avg views × $0.99
  const paidEps = sorted.filter(
    (e) => (e.episode_number ?? e.episodeNumber) >= position
  ).length;
  const estimatedRevenue = Math.round(estimatedViews * paidEps * 99 * 0.7); // cents, 70% retention of paid

  return {
    estimatedViews,
    estimatedConversion: Math.round(estimatedConversion * 100),
    estimatedRevenue,
  };
}

/**
 * Flag weak episodes: below-average retention and missing hook/cliffhanger.
 *
 * @param {Array} episodes - enriched episodes
 * @returns {Array} flagged episodes with suggestions
 */
export function flagWeakEpisodes(episodes) {
  if (episodes.length < 2) return [];

  const avgRetention =
    episodes.reduce(
      (s, e) => s + (e.avg_watch_pct ?? e.avgWatchPct ?? 0), 0
    ) / episodes.length;

  return episodes
    .filter((ep) => {
      const retention = ep.avg_watch_pct ?? ep.avgWatchPct ?? 0;
      return retention < avgRetention;
    })
    .map((ep) => {
      const retention = ep.avg_watch_pct ?? ep.avgWatchPct ?? 0;
      const epNum = ep.episode_number ?? ep.episodeNumber;
      const hasHook = (ep.hook_timestamp_seconds ?? ep.hookTimestamp) != null;
      const hasCH = (ep.cliffhanger_timestamp_seconds ?? ep.cliffhangerTimestamp) != null;

      const suggestions = [];
      if (!hasHook) {
        suggestions.push("Add a hook in the first 5 seconds to grab attention.");
      }
      if (!hasCH) {
        suggestions.push("Add a cliffhanger near the end to drive next-episode views.");
      }
      if (retention < avgRetention * 0.8) {
        suggestions.push("Consider tightening the pacing — retention is significantly below average.");
      }
      if (suggestions.length === 0) {
        suggestions.push("Review content quality — retention is below the series average.");
      }

      return {
        episode_number: epNum,
        title: ep.title,
        retention: Math.round(retention * 10) / 10,
        avgRetention: Math.round(avgRetention * 10) / 10,
        gap: Math.round((avgRetention - retention) * 10) / 10,
        hasHook,
        hasCliffhanger: hasCH,
        suggestions,
      };
    })
    .sort((a, b) => a.retention - b.retention);
}
