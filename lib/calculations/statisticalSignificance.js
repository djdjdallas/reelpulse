/**
 * Statistical significance calculations for A/B testing.
 * Implements two-sample z-test and t-test without external libraries.
 */

/**
 * Standard normal CDF approximation (Abramowitz and Stegun).
 */
function normalCDF(x) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Two-sample z-test for proportions (e.g., conversion rates).
 */
export function zTestProportions(p1, n1, p2, n2) {
  if (n1 === 0 || n2 === 0) return { zScore: 0, pValue: 1, significant: false };

  const pPooled = (p1 * n1 + p2 * n2) / (n1 + n2);
  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / n1 + 1 / n2));

  if (se === 0) return { zScore: 0, pValue: 1, significant: false };

  const z = (p1 - p2) / se;
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));

  return {
    zScore: z,
    pValue,
    significant: pValue < 0.05,
  };
}

/**
 * Two-sample t-test for means (e.g., average retention).
 */
export function tTestMeans(mean1, var1, n1, mean2, var2, n2) {
  if (n1 < 2 || n2 < 2) return { tScore: 0, pValue: 1, significant: false, df: 0 };

  const se = Math.sqrt(var1 / n1 + var2 / n2);
  if (se === 0) return { tScore: 0, pValue: 1, significant: false, df: 0 };

  const t = (mean1 - mean2) / se;

  // Welch-Satterthwaite degrees of freedom
  const num = (var1 / n1 + var2 / n2) ** 2;
  const den = (var1 / n1) ** 2 / (n1 - 1) + (var2 / n2) ** 2 / (n2 - 1);
  const df = den === 0 ? 1 : num / den;

  // Approximate p-value using normal distribution for large df
  const pValue = 2 * (1 - normalCDF(Math.abs(t)));

  return {
    tScore: t,
    pValue,
    significant: pValue < 0.05,
    df: Math.round(df),
  };
}

/**
 * Calculate confidence interval for difference in means.
 */
export function confidenceInterval(mean1, var1, n1, mean2, var2, n2, confidence = 0.95) {
  const diff = mean1 - mean2;
  const se = Math.sqrt(var1 / n1 + var2 / n2);

  // z-value for common confidence levels
  const zValues = { 0.90: 1.645, 0.95: 1.96, 0.99: 2.576 };
  const z = zValues[confidence] || 1.96;

  return {
    difference: diff,
    lower: diff - z * se,
    upper: diff + z * se,
    standardError: se,
  };
}

/**
 * Calculate experiment results given variant metrics.
 */
export function calculateExperimentResults(controlMetrics, treatmentMetrics, successMetric) {
  const cSample = controlMetrics.reduce((s, m) => s + m.sample_size, 0);
  const tSample = treatmentMetrics.reduce((s, m) => s + m.sample_size, 0);

  if (cSample === 0 || tSample === 0) {
    return {
      winner: null,
      pValue: 1,
      significant: false,
      confidenceInterval: null,
      lift: 0,
    };
  }

  let result;

  switch (successMetric) {
    case "conversion": {
      const cUnlocks = controlMetrics.reduce((s, m) => s + m.unlocks, 0);
      const tUnlocks = treatmentMetrics.reduce((s, m) => s + m.unlocks, 0);
      const cViews = controlMetrics.reduce((s, m) => s + m.views, 0);
      const tViews = treatmentMetrics.reduce((s, m) => s + m.views, 0);
      const cRate = cViews > 0 ? cUnlocks / cViews : 0;
      const tRate = tViews > 0 ? tUnlocks / tViews : 0;

      result = zTestProportions(tRate, tViews, cRate, cViews);
      result.lift = cRate > 0 ? ((tRate - cRate) / cRate) * 100 : 0;
      result.controlValue = cRate * 100;
      result.treatmentValue = tRate * 100;
      break;
    }
    case "retention": {
      const cRetention = controlMetrics.map((m) => m.avg_retention);
      const tRetention = treatmentMetrics.map((m) => m.avg_retention);
      const cMean = avg(cRetention);
      const tMean = avg(tRetention);
      const cVar = variance(cRetention);
      const tVar = variance(tRetention);

      result = tTestMeans(tMean, tVar, cRetention.length, cMean, cVar, cRetention.length);
      result.lift = cMean > 0 ? ((tMean - cMean) / cMean) * 100 : 0;
      result.controlValue = cMean;
      result.treatmentValue = tMean;

      const ci = confidenceInterval(tMean, tVar, tRetention.length, cMean, cVar, cRetention.length);
      result.confidenceInterval = ci;
      break;
    }
    default: {
      const cViews = controlMetrics.reduce((s, m) => s + m.views, 0);
      const tViews = treatmentMetrics.reduce((s, m) => s + m.views, 0);
      result = {
        pValue: 1,
        significant: false,
        lift: cViews > 0 ? ((tViews - cViews) / cViews) * 100 : 0,
        controlValue: cViews,
        treatmentValue: tViews,
      };
    }
  }

  result.winner = result.significant
    ? (result.lift > 0 ? "treatment" : "control")
    : null;
  result.controlSampleSize = cSample;
  result.treatmentSampleSize = tSample;

  return result;
}

function avg(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

function variance(arr) {
  if (arr.length < 2) return 0;
  const mean = avg(arr);
  return arr.reduce((s, v) => s + (v - mean) ** 2, 0) / (arr.length - 1);
}
