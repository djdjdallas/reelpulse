"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
    posthog.capture("error_occurred", {
      error_message: error.message,
      error_digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="bg-muted rounded-full p-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">{error.message}</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
