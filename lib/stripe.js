import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

// Browser-side Stripe loader (singleton)
let stripePromise = null;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    );
  }
  return stripePromise;
}

// Plan config
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    features: [
      "1 series",
      "20 episodes per series",
      "Basic analytics",
      "Manual metrics entry",
    ],
    limits: {
      maxSeries: 1,
      maxEpisodesPerSeries: 20,
      hasOptimizer: false,
      hasCSVUpload: false,
    },
  },
  pro: {
    name: "Pro",
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "10 series",
      "Unlimited episodes",
      "Full analytics dashboard",
      "CSV upload",
      "Paywall optimizer",
      "Series health score",
      "Email support",
    ],
    limits: {
      maxSeries: 10,
      maxEpisodesPerSeries: Infinity,
      hasOptimizer: true,
      hasCSVUpload: true,
    },
  },
  studio: {
    name: "Studio",
    price: 199,
    priceId: process.env.STRIPE_STUDIO_PRICE_ID,
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
    limits: {
      maxSeries: Infinity,
      maxEpisodesPerSeries: Infinity,
      hasOptimizer: true,
      hasCSVUpload: true,
    },
  },
};
