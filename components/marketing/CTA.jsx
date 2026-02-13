import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl rounded-2xl border border-primary/20 bg-primary/5 p-12 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Ready to optimize your micro-drama?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Join creators who are using data to make smarter decisions about their
          series. Start free, upgrade when you&apos;re ready.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="text-base px-8">
            <Link href="/login">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
