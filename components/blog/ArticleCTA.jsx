import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function ArticleCTA() {
  return (
    <section className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-12">
      <h2 className="text-2xl font-bold sm:text-3xl">
        Ready to put these insights into action?
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
        Reelytics gives you episode-level analytics, paywall optimization, and
        cross-platform reporting — all in one dashboard.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/login">
          Get Started Free
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </section>
  );
}
