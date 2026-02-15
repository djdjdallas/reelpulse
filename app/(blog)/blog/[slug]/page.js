import { notFound } from "next/navigation";
import { getAllSlugs, getArticleBySlug, getRelatedArticles } from "@/data/blog";
import { ArticleRenderer } from "@/components/blog/ArticleRenderer";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { ArticleCTA } from "@/components/blog/ArticleCTA";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.seo.metaTitle,
    description: article.seo.metaDescription,
    keywords: article.seo.keywords,
    openGraph: {
      title: article.seo.metaTitle,
      description: article.seo.metaDescription,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.seo.metaTitle,
      description: article.seo.metaDescription,
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = getRelatedArticles(slug, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Organization",
      name: article.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Reelytics",
      url: "https://reelytics.io",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://reelytics.io/blog/${article.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl">
        <BlogHeader article={article} />
      </div>

      {/* Two-column layout: content + TOC */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_220px]">
        <article className="mx-auto w-full max-w-3xl">
          <ArticleRenderer sections={article.sections} />
        </article>
        <TableOfContents sections={article.sections} />
      </div>

      {/* Bottom CTA */}
      <div className="mx-auto mt-16 max-w-3xl">
        <ArticleCTA />
      </div>

      {/* Related articles */}
      <div className="mt-16">
        <RelatedArticles articles={related} />
      </div>
    </div>
  );
}
