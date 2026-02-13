import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryLabel, getCategoryStyle } from "@/data/blog/categories";

export function ArticleCard({ article, featured = false }) {
  const categoryStyle = getCategoryStyle(article.category);

  return (
    <Link href={`/blog/${article.slug}`} className="group">
      <Card
        className={cn(
          "h-full transition-colors hover:border-primary/30 hover:bg-card/80",
          featured && "sm:flex-row"
        )}
      >
        <CardContent className={cn("flex flex-col gap-3", featured && "flex-1")}>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-xs border", categoryStyle)}
            >
              {getCategoryLabel(article.category)}
            </Badge>
          </div>
          <h3
            className={cn(
              "font-semibold leading-snug transition-colors group-hover:text-primary",
              featured ? "text-xl sm:text-2xl" : "text-lg"
            )}
          >
            {article.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {article.description}
          </p>
          <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
