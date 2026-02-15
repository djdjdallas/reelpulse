"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export function PostHogIdentify({ userId, email, name, plan }) {
  useEffect(() => {
    if (userId) {
      posthog.identify(userId, { email, name, plan });
    }
  }, [userId, email, name, plan]);

  return null;
}
