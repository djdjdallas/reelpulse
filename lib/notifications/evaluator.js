/**
 * Alert threshold evaluation logic.
 * Compares current metrics against previous snapshots and user-defined thresholds.
 */

export function evaluateAlerts({ currentSnapshot, previousSnapshot, preferences }) {
  const alerts = [];

  if (!previousSnapshot || !preferences) return alerts;

  // Retention drop alert
  if (
    currentSnapshot.avg_retention != null &&
    previousSnapshot.avg_retention != null &&
    preferences.retention_drop_threshold
  ) {
    const drop = previousSnapshot.avg_retention - currentSnapshot.avg_retention;
    if (drop >= preferences.retention_drop_threshold) {
      alerts.push({
        type: "retention_drop",
        title: "Retention Drop Detected",
        message: `Average retention dropped by ${drop.toFixed(1)}% (from ${previousSnapshot.avg_retention.toFixed(1)}% to ${currentSnapshot.avg_retention.toFixed(1)}%).`,
        metadata: {
          series_id: currentSnapshot.series_id,
          previous: previousSnapshot.avg_retention,
          current: currentSnapshot.avg_retention,
          drop,
        },
      });
    }
  }

  // Health score dip alert
  if (
    currentSnapshot.health_score != null &&
    previousSnapshot.health_score != null &&
    preferences.health_score_dip_threshold
  ) {
    const dip = previousSnapshot.health_score - currentSnapshot.health_score;
    if (dip >= preferences.health_score_dip_threshold) {
      alerts.push({
        type: "health_score_dip",
        title: "Health Score Declined",
        message: `Series health score dropped by ${dip.toFixed(1)} points (from ${previousSnapshot.health_score.toFixed(1)} to ${currentSnapshot.health_score.toFixed(1)}).`,
        metadata: {
          series_id: currentSnapshot.series_id,
          previous: previousSnapshot.health_score,
          current: currentSnapshot.health_score,
          dip,
        },
      });
    }
  }

  // Paywall conversion threshold alert
  if (
    currentSnapshot.paywall_conversion_rate != null &&
    previousSnapshot.paywall_conversion_rate != null &&
    preferences.paywall_conversion_threshold
  ) {
    const drop =
      previousSnapshot.paywall_conversion_rate - currentSnapshot.paywall_conversion_rate;
    if (drop >= preferences.paywall_conversion_threshold) {
      alerts.push({
        type: "paywall_conversion",
        title: "Paywall Conversion Decline",
        message: `Paywall conversion rate dropped by ${drop.toFixed(1)}% (from ${previousSnapshot.paywall_conversion_rate.toFixed(1)}% to ${currentSnapshot.paywall_conversion_rate.toFixed(1)}%).`,
        metadata: {
          series_id: currentSnapshot.series_id,
          previous: previousSnapshot.paywall_conversion_rate,
          current: currentSnapshot.paywall_conversion_rate,
          drop,
        },
      });
    }
  }

  return alerts;
}
