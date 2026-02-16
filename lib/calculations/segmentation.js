/**
 * Audience segmentation logic.
 * Since we only have aggregate episode-level data (no individual viewer tracking),
 * segmentation is episode-behavior clustering — identifying patterns in episode metrics.
 */

const SEGMENT_DEFINITIONS = {
  binger: {
    name: "Binger-Pattern Episodes",
    description: "Episodes with rapid view accumulation and high retention",
    classify: (episode, metrics) => {
      const avgRetention = average(metrics, "avg_percent_watched");
      const avgViews = average(metrics, "views");
      return avgRetention > 60 && avgViews > 0;
    },
  },
  casual: {
    name: "Casual Viewer Episodes",
    description: "Episodes with moderate engagement and lower retention",
    classify: (episode, metrics) => {
      const avgRetention = average(metrics, "avg_percent_watched");
      return avgRetention >= 20 && avgRetention <= 60;
    },
  },
  free_viewer: {
    name: "Free-Only Episodes",
    description: "Free episodes viewed by non-converting audience",
    classify: (episode, metrics) => {
      return episode.is_free && sum(metrics, "unlocks") === 0;
    },
  },
  converted: {
    name: "Conversion-Driving Episodes",
    description: "Episodes that drive paywall conversions",
    classify: (episode, metrics) => {
      return sum(metrics, "unlocks") > 0;
    },
  },
  churned: {
    name: "Churn-Indicating Episodes",
    description: "Episodes with significant view drops vs previous",
    classify: (episode, metrics, allEpisodeMetrics, episodes) => {
      const currentViews = sum(metrics, "views");
      const prevEp = episodes.find((e) => e.episode_number === episode.episode_number - 1);
      if (!prevEp) return false;
      const prevMetrics = allEpisodeMetrics.get(prevEp.id) || [];
      const prevViews = sum(prevMetrics, "views");
      return prevViews > 0 && currentViews / prevViews < 0.5;
    },
  },
};

function sum(metrics, field) {
  return metrics.reduce((s, m) => s + (m[field] || 0), 0);
}

function average(metrics, field) {
  if (!metrics.length) return 0;
  return metrics.reduce((s, m) => s + (m[field] || 0), 0) / metrics.length;
}

/**
 * Classify episodes into a segment type.
 */
export function classifyEpisodes(type, episodes, allMetrics) {
  const definition = SEGMENT_DEFINITIONS[type];
  if (!definition) return [];

  const metricsByEpisode = new Map();
  for (const m of allMetrics) {
    const list = metricsByEpisode.get(m.episode_id) || [];
    list.push(m);
    metricsByEpisode.set(m.episode_id, list);
  }

  return episodes.filter((ep) => {
    const epMetrics = metricsByEpisode.get(ep.id) || [];
    return definition.classify(ep, epMetrics, metricsByEpisode, episodes);
  });
}

/**
 * Analyze a segment across a series.
 */
export function analyzeSegment(segmentEpisodes, allMetrics, allEpisodes) {
  if (!segmentEpisodes.length) {
    return {
      estimated_size: 0,
      avg_retention: 0,
      conversion_rate: 0,
      avg_views_per_episode: 0,
      avg_revenue_per_episode: 0,
      journey_data: { episodes: [] },
    };
  }

  const metricsByEpisode = new Map();
  for (const m of allMetrics) {
    const list = metricsByEpisode.get(m.episode_id) || [];
    list.push(m);
    metricsByEpisode.set(m.episode_id, list);
  }

  let totalViews = 0;
  let totalRetention = 0;
  let totalUnlocks = 0;
  let totalRevenue = 0;
  const journey = [];

  for (const ep of segmentEpisodes) {
    const metrics = metricsByEpisode.get(ep.id) || [];
    const views = sum(metrics, "views");
    const retention = average(metrics, "avg_percent_watched");
    const unlocks = sum(metrics, "unlocks");
    const revenue = sum(metrics, "revenue_cents");

    totalViews += views;
    totalRetention += retention;
    totalUnlocks += unlocks;
    totalRevenue += revenue;

    journey.push({
      episode_number: ep.episode_number,
      views,
      retention,
      unlocks,
    });
  }

  const count = segmentEpisodes.length;

  return {
    estimated_size: count,
    avg_retention: totalRetention / count,
    conversion_rate: totalViews > 0 ? (totalUnlocks / totalViews) * 100 : 0,
    avg_views_per_episode: totalViews / count,
    avg_revenue_per_episode: totalRevenue / count,
    journey_data: { episodes: journey },
  };
}

export { SEGMENT_DEFINITIONS };
