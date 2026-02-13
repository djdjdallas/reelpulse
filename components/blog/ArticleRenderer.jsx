import Link from "next/link";
import { cn } from "@/lib/utils";
import { Info, Lightbulb, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const calloutConfig = {
  tip: {
    icon: Lightbulb,
    className: "border-amber-500/30 bg-amber-500/5 text-amber-200",
    iconClassName: "text-amber-400",
  },
  info: {
    icon: Info,
    className: "border-blue-500/30 bg-blue-500/5 text-blue-200",
    iconClassName: "text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-red-500/30 bg-red-500/5 text-red-200",
    iconClassName: "text-red-400",
  },
};

function RenderSection({ section }) {
  switch (section.type) {
    case "introduction":
      return (
        <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
          {section.content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      );

    case "heading":
      if (section.level === 2) {
        return (
          <h2
            id={section.id}
            className="scroll-mt-24 text-2xl font-bold tracking-tight sm:text-3xl"
          >
            {section.text}
          </h2>
        );
      }
      return (
        <h3
          id={section.id}
          className="scroll-mt-24 text-xl font-semibold tracking-tight"
        >
          {section.text}
        </h3>
      );

    case "paragraph":
      return (
        <p className="leading-relaxed text-muted-foreground">{section.content}</p>
      );

    case "list": {
      const Tag = section.style === "ordered" ? "ol" : "ul";
      return (
        <Tag
          className={cn(
            "space-y-2 pl-6 text-muted-foreground",
            section.style === "ordered" ? "list-decimal" : "list-disc"
          )}
        >
          {section.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {item}
            </li>
          ))}
        </Tag>
      );
    }

    case "callout": {
      const config = calloutConfig[section.variant] || calloutConfig.info;
      const Icon = config.icon;
      return (
        <div
          className={cn(
            "flex gap-3 rounded-lg border p-4",
            config.className
          )}
        >
          <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconClassName)} />
          <p className="leading-relaxed">{section.content}</p>
        </div>
      );
    }

    case "cta":
      return (
        <div className="my-8 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center sm:p-8">
          <h3 className="text-xl font-bold">{section.heading}</h3>
          <p className="mt-2 text-muted-foreground">{section.text}</p>
          <Button asChild className="mt-4">
            <Link href={section.buttonHref}>
              {section.buttonText}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      );

    case "blockquote":
      return (
        <blockquote className="border-l-2 border-primary/50 pl-6 italic text-muted-foreground">
          <p className="leading-relaxed">{section.content}</p>
          {section.attribution && (
            <footer className="mt-2 text-sm not-italic text-muted-foreground/70">
              — {section.attribution}
            </footer>
          )}
        </blockquote>
      );

    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {section.headers.map((header, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left font-medium text-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 last:border-0"
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-4 py-3 text-muted-foreground"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

export function ArticleRenderer({ sections }) {
  return (
    <div className="space-y-6">
      {sections.map((section, i) => (
        <RenderSection key={i} section={section} />
      ))}
    </div>
  );
}
