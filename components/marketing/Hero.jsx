import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Gradient background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <BarChart3 className="h-4 w-4" />
            Analytics for Micro-Drama Creators
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Stop Guessing.{" "}
          <span className="text-primary">Start Optimizing.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Know exactly where viewers drop off, which hooks grab attention, and
          where to place your paywall for maximum revenue. Built for ReelShort,
          DramaBox, and every micro-drama platform.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-base px-8">
            <Link href="/login">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base px-8">
            <Link href="#pricing">View Pricing</Link>
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required. Free plan includes 1 series.
        </p>
      </div>
    </section>
  );
}
