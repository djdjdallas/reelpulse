/**
 * Cohort analysis logic.
 * Slices episode_metrics by date ranges to calculate per-episode retention per cohort.
 */

/**
 * Generate cohort definitions based on type.
 */
export function generateCohortDefinitions(type, series, episodes, metrics) {
  if (!metrics.length) return [];

  const dates = metrics.map((m) => new Date(m.date)).sort((a, b) => a - b);
  const earliest = dates[0];
  const latest = dates[dates.length - 1];

  switch (type) {
    case "weekly":
      return generateWeeklyCohorts(earliest, latest);
    case "monthly":
      return generateMonthlyCohorts(earliest, latest);
    case "pre_paywall":
    case "post_paywall":
      return generatePaywallCohorts(series, earliest, latest);
    default:
      return [];
  }
}

function generateWeeklyCohorts(start, end) {
  const cohorts = [];
  const current = new Date(start);
  current.setDate(current.getDate() - current.getDay()); // Start of week

  while (current <= end) {
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);

    cohorts.push({
      name: `Week of ${current.toISOString().split("T")[0]}`,
      type: "weekly",
      date_from: current.toISOString().split("T")[0],
      date_to: weekEnd.toISOString().split("T")[0],
    });

    current.setDate(current.getDate() + 7);
  }

  return cohorts;
}

function generateMonthlyCohorts(start, end) {
  const cohorts = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    cohorts.push({
      name: `${monthNames[current.getMonth()]} ${current.getFullYear()}`,
      type: "monthly",
      date_from: current.toISOString().split("T")[0],
      date_to: monthEnd.toISOString().split("T")[0],
    });

    current.setMonth(current.getMonth() + 1);
  }

  return cohorts;
}

function generatePaywallCohorts(series, start, end) {
  if (!series.paywall_episode) return [];

  const midpoint = new Date((start.getTime() + end.getTime()) / 2);

  return [
    {
      name: "Pre-Paywall Period",
      type: "pre_paywall",
      date_from: start.toISOString().split("T")[0],
      date_to: midpoint.toISOString().split("T")[0],
    },
    {
      name: "Post-Paywall Period",
      type: "post_paywall",
      date_from: midpoint.toISOString().split("T")[0],
      date_to: end.toISOString().split("T")[0],
    },
  ];
}

/**
 * Calculate per-episode retention for a given date range.
 */
export function calculateCohortRetention(episodes, metrics, dateFrom, dateTo) {
  const filteredMetrics = metrics.filter((m) => {
    const d = m.date;
    return (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo);
  });

  // Group by episode
  const byEpisode = new Map();
  for (const m of filteredMetrics) {
    const list = byEpisode.get(m.episode_id) || [];
    list.push(m);
    byEpisode.set(m.episode_id, list);
  }

  // Get episode 1 views as baseline
  const ep1 = episodes.find((e) => e.episode_number === 1);
  const ep1Metrics = ep1 ? byEpisode.get(ep1.id) || [] : [];
  const baselineViews = ep1Metrics.reduce((sum, m) => sum + (m.views || 0), 0);

  if (baselineViews === 0) {
    return episodes.map((ep) => ({
      episode_number: ep.episode_number,
      retention_pct: ep.episode_number === 1 ? 100 : 0,
      views: 0,
    }));
  }

  return episodes
    .sort((a, b) => a.episode_number - b.episode_number)
    .map((ep) => {
      const epMetrics = byEpisode.get(ep.id) || [];
      const totalViews = epMetrics.reduce((sum, m) => sum + (m.views || 0), 0);
      const retention = (totalViews / baselineViews) * 100;

      return {
        episode_number: ep.episode_number,
        retention_pct: Math.min(retention, 100),
        views: totalViews,
      };
    });
}
