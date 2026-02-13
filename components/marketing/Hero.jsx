import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { SeriesRetentionCard } from "@/components/marketing/SeriesRetentionCard";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Gradient background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left Column — Copy */}
        <div>
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            For Micro-Drama Creators
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Stop Guessing.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Start Optimizing.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            The first analytics platform built for the $11B micro-drama industry.
            Visualize retention, score hooks, and optimize paywall placement to
            maximize revenue.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/login">Start Free — No Credit Card</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8">
              <Link href="#features">View Demo</Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-8 flex items-center gap-3">
            {/* Overlapping avatar circles */}
            <div className="flex -space-x-2">
              {["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"].map(
                (color, i) => (
                  <div
                    key={i}
                    className={`h-8 w-8 rounded-full ${color} ring-2 ring-background`}
                  />
                )
              )}
            </div>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>

            <span className="text-sm text-muted-foreground">
              Trusted by 500+ indie creators
            </span>
          </div>
        </div>

        {/* Right Column — Interactive Card */}
        <div className="pt-6">
          <SeriesRetentionCard />
        </div>
      </div>
    </section>
  );
}
