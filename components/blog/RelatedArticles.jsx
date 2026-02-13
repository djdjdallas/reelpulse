import { ArticleCard } from "./ArticleCard";

export function RelatedArticles({ articles }) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Related Articles</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
