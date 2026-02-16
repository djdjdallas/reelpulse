"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import posthog from "posthog-js";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSent(true);
    posthog.capture("sign_in", { method: "magic_link" });
    toast.success("Check your email for the magic link!");
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
        <p className="text-sm font-medium">Magic link sent!</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Check your email at <strong>{email}</strong> and click the link to sign
          in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" variant="outline" className="w-full" disabled={loading}>
        {loading ? "Sending link..." : "Send Magic Link"}
      </Button>
    </form>
  );
}
