import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateExperimentResults } from "@/lib/calculations/statisticalSignificance";

export async function GET(request, { params }) {
  try {
    const { experimentId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: experiment } = await supabase
      .from("experiments")
      .select("*")
      .eq("id", experimentId)
      .single();

    if (!experiment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: variants } = await supabase
      .from("experiment_variants")
      .select("*")
      .eq("experiment_id", experimentId);

    const control = variants?.find((v) => v.is_control);
    const treatment = variants?.find((v) => !v.is_control);

    if (!control || !treatment) {
      return NextResponse.json({ error: "Missing variants" }, { status: 400 });
    }

    const { data: controlMetrics } = await supabase
      .from("experiment_metrics")
      .select("*")
      .eq("variant_id", control.id);

    const { data: treatmentMetrics } = await supabase
      .from("experiment_metrics")
      .select("*")
      .eq("variant_id", treatment.id);

    const results = calculateExperimentResults(
      controlMetrics || [],
      treatmentMetrics || [],
      experiment.success_metric
    );

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
