import { article as article1 } from "./articles/short-form-series-analytics-complete-guide-2026";
import { article as article2 } from "./articles/track-youtube-shorts-series-performance";
import { article as article3 } from "./articles/tiktok-series-analytics-measure-episodes-retention-revenue";
import { article as article4 } from "./articles/reelshort-analytics-creators-need";
import { article as article5 } from "./articles/good-retention-rate-short-form-video-series";
import { article as article6 } from "./articles/find-perfect-paywall-episode-vertical-drama";
import { article as article7 } from "./articles/paywall-optimization-short-form-creators";
import { article as article8 } from "./articles/measure-binge-rate-episode-drop-off";
import { article as article9 } from "./articles/analytics-stack-short-form-content-studios-2026";
import { article as article10 } from "./articles/short-form-funnel-metrics-view-to-subscriber";
import { article as article11 } from "./articles/alternatives-tiktok-analytics-serious-creators";
import { article as article12 } from "./articles/youtube-studio-vs-dedicated-shorts-analytics";
import { article as article13 } from "./articles/creator-economy-analytics-tools-compared";
import { article as article14 } from "./articles/studios-standardize-reporting-across-platforms";
import { article as article15 } from "./articles/ab-tests-paywall-placement-video-series";
import { article as article16 } from "./articles/episode-level-analytics-missing-metric";
import { article as article17 } from "./articles/track-revenue-by-episode-reelshort-tiktok";
import { article as article18 } from "./articles/cohort-retention-paywalled-short-form-series";
import { article as article19 } from "./articles/common-analytics-mistakes-short-form-creators";
import { article as article20 } from "./articles/gut-feel-to-data-driven-vertical-drama-studio";
import { article as article21 } from "./articles/dramabox-analytics-studios-need-to-track";
import { article as article22 } from "./articles/reelshort-vs-dramabox-which-pays-creators-more";
import { article as article23 } from "./articles/revenue-per-episode-north-star-metric-short-form-studios";
import { article as article24 } from "./articles/is-analytics-software-worth-it-short-form-creators-roi";
import { article as article25 } from "./articles/switching-spreadsheets-to-automated-series-analytics";
import { article as article26 } from "./articles/shorttv-vs-reelshort-vs-dramabox-platform-comparison";
import { article as article27 } from "./articles/get-series-accepted-reelshort-dramabox-shorttv";
import { article as article28 } from "./articles/data-driven-paywall-placement-romance-series";
import { article as article29 } from "./articles/revenge-dramas-analytics-perfect-payoff-episode";
import { article as article30 } from "./articles/supernatural-werewolf-series-binge-analytics";
import { article as article31 } from "./articles/mystery-thriller-short-dramas-retention-benchmarks";
import { article as article32 } from "./articles/why-viewers-drop-off-episode-3-how-to-fix";
import { article as article33 } from "./articles/ideal-episode-length-by-genre-data-benchmarks";
import { article as article34 } from "./articles/new-series-vs-keep-adding-episodes-analytics-signals";
import { article as article35 } from "./articles/how-to-price-short-form-series-coins-bundles";
import { article as article36 } from "./articles/tiktok-algorithm-series-vs-one-off-videos-2026";
import { article as article37 } from "./articles/zombie-episodes-kill-series-binge-rate";
import { article as article38 } from "./articles/analytics-playbook-micro-drama-studios-weekly-rituals";
import { article as article39 } from "./articles/series-pnl-reporting-layer-short-form-shows";
import { article as article40 } from "./articles/calculate-cac-paywall-unlockers";
import { article as article41 } from "./articles/avod-vs-iap-ad-funded-vs-pay-per-episode";
import { article as article42 } from "./articles/ai-written-short-dramas-need-better-analytics";
import { article as article43 } from "./articles/s-class-productions-analytics-de-risk-big-budget";
import { article as article44 } from "./articles/winning-genres-short-form-drama-2026";
import { article as article45 } from "./articles/why-exolyt-pentos-not-built-episodic-creators";
import { article as article46 } from "./articles/vidiq-vs-reelytics-channel-growth-vs-series-analytics";
import { article as article47 } from "./articles/best-analytics-tools-multi-platform-micro-drama";
import { article as article48 } from "./articles/reelytics-pricing-guide-choosing-right-plan";
import { article as article49 } from "./articles/best-analytics-tool-tiktok-series-paywall-conversions";
import { article as article50 } from "./articles/alternative-socialinsider-episodic-short-form-creators";

const allArticles = [
  article1, article2, article3, article4, article5,
  article6, article7, article8, article9, article10,
  article11, article12, article13, article14, article15,
  article16, article17, article18, article19, article20,
  article21, article22, article23, article24, article25,
  article26, article27, article28, article29, article30,
  article31, article32, article33, article34, article35,
  article36, article37, article38, article39, article40,
  article41, article42, article43, article44, article45,
  article46, article47, article48, article49, article50,
];

export function getAllArticles() {
  return allArticles.sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );
}

export function getArticleBySlug(slug) {
  return allArticles.find((a) => a.slug === slug) || null;
}

export function getArticlesByCategory(categoryKey) {
  return getAllArticles().filter((a) => a.category === categoryKey);
}

export function getRelatedArticles(slug, limit = 3) {
  const article = getArticleBySlug(slug);
  if (!article) return [];

  if (article.relatedSlugs?.length) {
    const related = article.relatedSlugs
      .map((s) => getArticleBySlug(s))
      .filter(Boolean);
    if (related.length >= limit) return related.slice(0, limit);
  }

  return getAllArticles()
    .filter((a) => a.slug !== slug && a.category === article.category)
    .slice(0, limit);
}

export function getFeaturedArticles() {
  return getAllArticles().filter((a) => a.featured);
}

export function getAllSlugs() {
  return allArticles.map((a) => a.slug);
}
