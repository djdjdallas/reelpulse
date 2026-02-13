import {
  BarChart3,
  TrendingUp,
  Zap,
  Shield,
  Upload,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: BarChart3,
    title: "Retention Analytics",
    description:
      "See exactly where viewers drop off with episode-by-episode retention waterfall charts.",
  },
  {
    icon: Target,
    title: "Paywall Optimizer",
    description:
      "AI-powered recommendation engine finds the perfect paywall position to maximize conversions.",
  },
  {
    icon: Zap,
    title: "Hook Effectiveness",
    description:
      "Measure which hooks grab attention in the first 5 seconds and correlate with watch-through rates.",
  },
  {
    icon: TrendingUp,
    title: "Series Health Score",
    description:
      "One number that tells you how your series is performing across retention, engagement, and revenue.",
  },
  {
    icon: Upload,
    title: "CSV Import",
    description:
      "Bulk upload metrics from any platform. Drag, drop, validate, and import in seconds.",
  },
  {
    icon: Shield,
    title: "Cliffhanger Impact",
    description:
      "Track how cliffhangers drive next-episode viewership and identify weak episode transitions.",
  },
];

export function Features() {
  return (
    <section className="py-24" id="features">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything you need to optimize your series
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From retention analytics to paywall optimization, ReelPulse gives
            you the data to make every episode count.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
