import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryLabel, getCategoryStyle } from "@/data/blog/categories";

export function BlogHeader({ article }) {
  const categoryStyle = getCategoryStyle(article.category);

  return (
    <header className="space-y-4">
      <Badge
        variant="outline"
        className={cn("text-xs border", categoryStyle)}
      >
        {getCategoryLabel(article.category)}
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {article.title}
      </h1>
      <p className="text-lg text-muted-foreground">{article.description}</p>
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          {article.author.name}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {new Date(article.publishedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {article.readingTime}
        </span>
      </div>
      <Separator />
    </header>
  );
}
