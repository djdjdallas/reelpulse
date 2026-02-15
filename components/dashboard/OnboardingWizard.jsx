"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { GENRES, PLATFORMS } from "@/lib/utils/constants";
import posthog from "posthog-js";
import {
  BarChart3,
  CheckCircle2,
  Database,
  FileText,
  Rocket,
} from "lucide-react";

const STEPS = ["Welcome", "Create Series", "Add Data", "Done"];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    genre: "",
    platform: "",
  });
  const [createdSeriesId, setCreatedSeriesId] = useState(null);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateSeries() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      toast.error("No workspace found");
      setLoading(false);
      return;
    }

    const { data: series, error } = await supabase
      .from("series")
      .insert({
        title: form.title.trim(),
        genre: form.genre || null,
        platform: form.platform || null,
        workspace_id: membership.workspace_id,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setCreatedSeriesId(series.id);
    posthog.capture("onboarding_step_completed", { step: 1, step_name: "create_series" });
    toast.success("Series created!");
    setStep(2);
  }

  async function handleLoadSampleData() {
    setLoading(true);
    try {
      const res = await fetch("/api/sample-data", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load sample data");
      posthog.capture("onboarding_step_completed", { step: 2, step_name: "add_data", data_source: "sample" });
      toast.success("Sample data loaded!");
      setStep(3);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFinish() {
    posthog.capture("onboarding_completed");
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("profiles")
      .update({ has_completed_onboarding: true })
      .eq("id", user.id);

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                i <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-8 ${
                  i < step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Welcome */}
      {step === 0 && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Reelytics!</CardTitle>
            <CardDescription>
              Let&apos;s get you set up in just a few steps.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Track episode views, retention, and revenue</span>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Optimize paywall placement with data-driven insights</span>
              </li>
              <li className="flex items-start gap-3">
                <Database className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Compare performance across platforms and genres</span>
              </li>
            </ul>
            <div className="flex gap-3">
              <Button onClick={() => { posthog.capture("onboarding_started"); setStep(1); }} className="flex-1">
                Get Started
              </Button>
              <Button variant="ghost" onClick={() => { posthog.capture("onboarding_skipped", { skipped_at_step: 0 }); handleFinish(); }} disabled={loading}>
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Create Series */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Create Your First Series</CardTitle>
            <CardDescription>
              Add a series to start tracking its performance. You can always add more later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. The Billionaire's Secret"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Genre</Label>
                <Select
                  value={form.genre}
                  onValueChange={(v) => updateField("genre", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={form.platform}
                  onValueChange={(v) => updateField("platform", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCreateSeries}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Series"}
              </Button>
              <Button variant="outline" onClick={() => { posthog.capture("onboarding_step_completed", { step: 1, step_name: "create_series", skipped: true }); setStep(2); }}>
                Skip this step
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Add Data */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Add Some Data</CardTitle>
            <CardDescription>
              Load sample data to explore the dashboard, or add your own data later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={handleLoadSampleData}
                disabled={loading}
                className="flex flex-col items-center gap-3 rounded-lg border border-border p-6 text-center transition-colors hover:bg-muted/50 disabled:opacity-50"
              >
                <Database className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Load Sample Data</p>
                  <p className="text-sm text-muted-foreground">
                    Explore with a pre-built series
                  </p>
                </div>
              </button>
              <button
                onClick={() => { posthog.capture("onboarding_step_completed", { step: 2, step_name: "add_data", skipped: true }); setStep(3); }}
                className="flex flex-col items-center gap-3 rounded-lg border border-border p-6 text-center transition-colors hover:bg-muted/50"
              >
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">I&apos;ll add my own</p>
                  <p className="text-sm text-muted-foreground">
                    Skip and add data manually
                  </p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Done */}
      {step === 3 && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">You&apos;re all set!</CardTitle>
            <CardDescription>
              Your workspace is ready. Head to the dashboard to start analyzing your series.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleFinish} disabled={loading} size="lg">
              {loading ? "Finishing..." : "Go to Dashboard"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
