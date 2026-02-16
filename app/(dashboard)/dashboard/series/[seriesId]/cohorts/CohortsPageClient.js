"use client";

import { useRouter } from "next/navigation";
import { CohortGenerator } from "@/components/cohorts/CohortGenerator";
import { CohortRetentionHeatmap } from "@/components/cohorts/CohortRetentionHeatmap";
import { CohortComparisonChart } from "@/components/cohorts/CohortComparisonChart";
import { PaywallCohortSplit } from "@/components/cohorts/PaywallCohortSplit";

export function CohortsPageClient({ seriesId, series, cohorts, retentionData }) {
  const router = useRouter();

  const preCohort = retentionData.find((d) => {
    const c = cohorts.find((co) => co.id === d.cohortId);
    return c?.type === "pre_paywall";
  });
  const postCohort = retentionData.find((d) => {
    const c = cohorts.find((co) => co.id === d.cohortId);
    return c?.type === "post_paywall";
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cohort Analysis</h1>
        <p className="text-sm text-muted-foreground">
          {series.title} — Compare retention across different time periods.
        </p>
      </div>

      <CohortGenerator seriesId={seriesId} onGenerated={() => router.refresh()} />

      <CohortRetentionHeatmap cohorts={cohorts} retentionData={retentionData} />

      <CohortComparisonChart cohorts={cohorts} retentionData={retentionData} />

      {series.paywall_episode && preCohort && postCohort && (
        <PaywallCohortSplit
          prePaywall={preCohort.retention}
          postPaywall={postCohort.retention}
          paywallEpisode={series.paywall_episode}
        />
      )}
    </div>
  );
}
