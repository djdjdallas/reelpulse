import { Suspense } from "react";
import { getAllArticles, getFeaturedArticles } from "@/data/blog";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { CategoryFilter } from "@/components/blog/CategoryFilter";

export const metadata = {
  title: "Blog",
  description:
    "Insights and strategies for short-form series creators. Learn about analytics, paywall optimization, and growing your audience.",
  openGraph: {
    title: "ReelPulse Blog",
    description:
      "Insights and strategies for short-form series creators.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "ReelPulse Blog",
  description:
    "Insights and strategies for short-form series creators.",
  url: "https://reelpulse.com/blog",
  publisher: {
    "@type": "Organization",
    name: "ReelPulse",
    url: "https://reelpulse.com",
  },
};

function ArticleGrid({ category }) {
  const articles = getAllArticles();
  const filtered = category
    ? articles.filter((a) => a.category === category)
    : articles;
  const featured = getFeaturedArticles();
  const firstFeatured = featured[0];

  const nonFeatured = category
    ? filtered
    : filtered.filter((a) => a.slug !== firstFeatured?.slug);

  return (
    <>
      {/* Featured article — only on "All" view */}
      {!category && firstFeatured && (
        <div className="mb-8">
          <ArticleCard article={firstFeatured} featured />
        </div>
      )}

      {/* Article grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {nonFeatured.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No articles found in this category yet.
        </p>
      )}
    </>
  );
}

export default async function BlogIndexPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Page header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          ReelPulse Blog
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Insights and strategies for short-form series creators
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-8 flex justify-center">
        <Suspense>
          <CategoryFilter />
        </Suspense>
      </div>

      {/* Articles */}
      <ArticleGrid category={category} />
    </div>
  );
}
