"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { categories, categoryColors } from "@/data/blog/categories";

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") || "all";

  function handleFilter(key) {
    if (key === "all") {
      router.push("/blog", { scroll: false });
    } else {
      router.push(`/blog?category=${key}`, { scroll: false });
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleFilter("all")}
        className={cn(
          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
          active === "all"
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
        )}
      >
        All
      </button>
      {Object.values(categories).map((cat) => {
        const colorStyle = categoryColors[cat.color];
        return (
          <button
            key={cat.key}
            onClick={() => handleFilter(cat.key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              active === cat.key
                ? cn("border", colorStyle)
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
