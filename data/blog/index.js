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

const allArticles = [
  article1, article2, article3, article4, article5,
  article6, article7, article8, article9, article10,
  article11, article12, article13, article14, article15,
  article16, article17, article18, article19, article20,
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
