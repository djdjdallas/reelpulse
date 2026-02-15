import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/blog/categories";

export default function BlogLayout({ children }) {
  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <BarChart3 className="h-5 w-5 text-primary" />
            Reelytics
          </Link>
          <nav className="hidden items-center gap-6 text-sm sm:flex">
            <Link
              href="/blog"
              className="text-foreground font-medium transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <Link
                href="/"
                className="flex items-center gap-2 font-bold"
              >
                <BarChart3 className="h-4 w-4 text-primary" />
                Reelytics
              </Link>
              <p className="mt-2 text-sm text-muted-foreground">
                Analytics for short-form series creators.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Categories</p>
              <nav className="mt-2 flex flex-col gap-1.5">
                {Object.values(categories).map((cat) => (
                  <Link
                    key={cat.key}
                    href={`/blog?category=${cat.key}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <p className="text-sm font-medium">Product</p>
              <nav className="mt-2 flex flex-col gap-1.5">
                <Link
                  href="/#features"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/#pricing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
              </nav>
            </div>
          </div>
          <div className="mt-8 border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Reelytics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
