"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    key: "free",
    name: "Free",
    price: 0,
    description: "Get started with basic analytics",
    features: [
      "1 series",
      "20 episodes per series",
      "Basic analytics",
      "Manual metrics entry",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: 49,
    description: "Full analytics for growing creators",
    popular: true,
    features: [
      "10 series",
      "Unlimited episodes",
      "Full analytics dashboard",
      "CSV upload",
      "Paywall optimizer",
      "Series health score",
      "Email support",
    ],
  },
  {
    key: "studio",
    name: "Studio",
    price: 199,
    description: "For studios and power users",
    features: [
      "Unlimited series",
      "Unlimited episodes",
      "Full analytics dashboard",
      "CSV upload",
      "Paywall optimizer",
      "Series health score",
      "Priority support",
      "Team collaboration",
      "Custom exports",
    ],
  },
];

export function Pricing({ currentPlan, mode = "marketing" }) {
  const [loading, setLoading] = useState(null);

  async function handleUpgrade(planKey) {
    if (planKey === "free") return;

    setLoading(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to create checkout session");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function handleManage() {
    setLoading("manage");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to open billing portal");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
      {plans.map((plan) => {
        const isCurrent = currentPlan === plan.key;
        const isUpgrade =
          currentPlan &&
          plans.findIndex((p) => p.key === currentPlan) <
            plans.findIndex((p) => p.key === plan.key);

        return (
          <Card
            key={plan.key}
            className={`relative ${
              plan.popular ? "border-primary shadow-lg shadow-primary/10" : ""
            } ${isCurrent ? "ring-2 ring-primary" : ""}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            {isCurrent && (
              <Badge
                variant="outline"
                className="absolute -top-2.5 right-4 border-primary text-primary"
              >
                Current Plan
              </Badge>
            )}
            <CardHeader className="pt-8">
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-2">
                <span className="text-4xl font-bold">
                  ${plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {mode === "billing" ? (
                isCurrent ? (
                  currentPlan !== "free" ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleManage}
                      disabled={loading === "manage"}
                    >
                      {loading === "manage"
                        ? "Loading..."
                        : "Manage Subscription"}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  )
                ) : isUpgrade ? (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={loading === plan.key}
                  >
                    {loading === plan.key ? "Loading..." : `Upgrade to ${plan.name}`}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    {plan.price === 0 ? "Free Tier" : "Contact Us"}
                  </Button>
                )
              ) : (
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <a href="/login">
                    {plan.price === 0 ? "Get Started Free" : `Start ${plan.name}`}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
