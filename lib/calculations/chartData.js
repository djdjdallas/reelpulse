/**
 * Transform raw series metrics into chart-ready data structures.
 *
 * @param {Array} episodes - Episodes with fields from DB
 * @param {Array} metrics - All episode_metrics rows for this series
 * @returns {Object} Chart data objects
 */
export function buildChartData(episodes, metrics) {
  if (!episodes?.length) {
    return {
      retention: [],
      hooks: [],
      cliffhangers: [],
      paywall: [],
      tropes: [],
      stats: null,
    };
  }

  // Aggregate metrics per episode
  const epMetrics = aggregateByEpisode(episodes, metrics);

  const retention = epMetrics.map((e) => ({
    episode: `Ep ${e.episode_number}`,
    avgWatchPct: e.avgWatchPct,
  }));

  const hooks = epMetrics
    .filter((e) => e.hookTimestamp != null)
    .map((e) => ({
      episode: e.episode_number,
      hookTimestamp: e.hookTimestamp,
      avgWatchPct: e.avgWatchPct,
      views: e.totalViews,
    }));

  const cliffhangers = buildCliffhangerData(epMetrics);

  const paywall = epMetrics.map((e) => ({
    episode: `Ep ${e.episode_number}`,
    views: e.totalViews,
  }));

  const tropes = buildTropeData(epMetrics);

  const totalViews = epMetrics.reduce((s, e) => s + e.totalViews, 0);
  const totalRevenueCents = epMetrics.reduce((s, e) => s + e.totalRevenueCents, 0);
  const avgRetention =
    epMetrics.length > 0
      ? epMetrics.reduce((s, e) => s + e.avgWatchPct, 0) / epMetrics.length
      : 0;

  return {
    retention,
    hooks,
    cliffhangers,
    paywall,
    tropes,
    stats: {
      totalViews,
      avgRetention,
      totalRevenueCents,
    },
    // Also return the enriched episode data for health score
    enrichedEpisodes: epMetrics,
  };
}

function aggregateByEpisode(episodes, metrics) {
  const metricsByEp = {};
  for (const m of metrics || []) {
    if (!metricsByEp[m.episode_id]) metricsByEp[m.episode_id] = [];
    metricsByEp[m.episode_id].push(m);
  }

  return episodes
    .map((ep) => {
      const epMs = metricsByEp[ep.id] || [];
      const totalViews = epMs.reduce((s, m) => s + (m.views || 0), 0);
      const totalRevenueCents = epMs.reduce(
        (s, m) => s + (m.revenue_cents || 0),
        0
      );
      const avgWatchPct =
        epMs.length > 0
          ? epMs.reduce((s, m) => s + Number(m.avg_percent_watched || 0), 0) /
            epMs.length
          : 0;

      return {
        id: ep.id,
        episode_number: ep.episode_number,
        title: ep.title,
        is_free: ep.is_free,
        hook_timestamp_seconds: ep.hook_timestamp_seconds,
        hookTimestamp: ep.hook_timestamp_seconds,
        cliffhanger_timestamp_seconds: ep.cliffhanger_timestamp_seconds,
        cliffhangerTimestamp: ep.cliffhanger_timestamp_seconds,
        trope_tags: ep.trope_tags || [],
        totalViews,
        total_views: totalViews,
        totalRevenueCents,
        avgWatchPct,
        avg_watch_pct: avgWatchPct,
        views: totalViews,
      };
    })
    .sort((a, b) => a.episode_number - b.episode_number);
}

function buildCliffhangerData(epMetrics) {
  const data = [];
  for (let i = 0; i < epMetrics.length - 1; i++) {
    const current = epMetrics[i];
    const next = epMetrics[i + 1];
    const nextEpViewPct =
      current.totalViews > 0
        ? (next.totalViews / current.totalViews) * 100
        : 0;
    data.push({
      episode: `Ep ${current.episode_number}`,
      nextEpViewPct: Math.min(nextEpViewPct, 100),
      hasCliffhanger: current.cliffhanger_timestamp_seconds != null,
    });
  }
  return data;
}

function buildTropeData(epMetrics) {
  const tropeMap = {};

  for (const ep of epMetrics) {
    for (const trope of ep.trope_tags) {
      if (!tropeMap[trope]) {
        tropeMap[trope] = { episodes: [], totalViews: 0, totalRetention: 0 };
      }
      tropeMap[trope].episodes.push(ep);
      tropeMap[trope].totalViews += ep.totalViews;
      tropeMap[trope].totalRetention += ep.avgWatchPct;
    }
  }

  return Object.entries(tropeMap).map(([trope, data]) => ({
    trope,
    episodeCount: data.episodes.length,
    avgRetention: data.totalRetention / data.episodes.length,
    avgViews: data.totalViews / data.episodes.length,
    totalViews: data.totalViews,
  }));
}

/**
 * Calculate paywall conversion rate.
 */
export function calcConversionRate(epMetrics, paywallEpisode) {
  if (!paywallEpisode || !epMetrics?.length) return null;

  const prePaywall = epMetrics.find(
    (e) => e.episode_number === paywallEpisode - 1
  );
  const postPaywall = epMetrics.find(
    (e) => e.episode_number === paywallEpisode
  );

  if (!prePaywall || !postPaywall || prePaywall.totalViews === 0) return null;

  return (postPaywall.totalViews / prePaywall.totalViews) * 100;
}
