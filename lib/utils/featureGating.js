/**
 * Feature gating based on workspace plan.
 *
 * Free: 1 series, 20 eps, no optimizer/CSV
 * Pro:  10 series, unlimited eps, full analytics
 * Studio: unlimited everything
 */

const PLAN_LIMITS = {
  free: {
    maxSeries: 1,
    maxEpisodesPerSeries: 20,
    hasOptimizer: false,
    hasCSVUpload: false,
    hasHealthScore: false,
    hasIntegrations: false,
    hasAlerts: false,
    hasCSVExport: false,
    hasPDFExport: false,
    hasReportTemplates: false,
    hasTeamCollaboration: false,
    maxTeamMembers: 1,
    hasCrossPlatform: false,
    hasCohortAnalysis: false,
    hasABTesting: false,
    hasCustomDashboard: false,
    hasSegmentation: false,
    hasAdvancedSegmentation: false,
  },
  pro: {
    maxSeries: 10,
    maxEpisodesPerSeries: Infinity,
    hasOptimizer: true,
    hasCSVUpload: true,
    hasHealthScore: true,
    hasIntegrations: true,
    hasAlerts: true,
    hasCSVExport: true,
    hasPDFExport: false,
    hasReportTemplates: false,
    hasTeamCollaboration: false,
    maxTeamMembers: 1,
    hasCrossPlatform: true,
    hasCohortAnalysis: true,
    hasABTesting: false,
    hasCustomDashboard: false,
    hasSegmentation: true,
    hasAdvancedSegmentation: false,
  },
  studio: {
    maxSeries: Infinity,
    maxEpisodesPerSeries: Infinity,
    hasOptimizer: true,
    hasCSVUpload: true,
    hasHealthScore: true,
    hasIntegrations: true,
    hasAlerts: true,
    hasCSVExport: true,
    hasPDFExport: true,
    hasReportTemplates: true,
    hasTeamCollaboration: true,
    maxTeamMembers: 25,
    hasCrossPlatform: true,
    hasCohortAnalysis: true,
    hasABTesting: true,
    hasCustomDashboard: true,
    hasSegmentation: true,
    hasAdvancedSegmentation: true,
  },
};

export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function canCreateSeries(plan, currentSeriesCount) {
  const limits = getPlanLimits(plan);
  return currentSeriesCount < limits.maxSeries;
}

export function canAddEpisode(plan, currentEpisodeCount) {
  const limits = getPlanLimits(plan);
  return currentEpisodeCount < limits.maxEpisodesPerSeries;
}

export function hasFeature(plan, feature) {
  const limits = getPlanLimits(plan);
  return !!limits[feature];
}

export function getPlanName(plan) {
  const names = { free: "Free", pro: "Pro", studio: "Studio" };
  return names[plan] || "Free";
}
