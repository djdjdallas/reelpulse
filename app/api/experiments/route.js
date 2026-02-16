import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    const { data: experiments } = await supabase
      .from("experiments")
      .select("*")
      .eq("workspace_id", membership.workspace_id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ experiments: experiments || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, type, seriesId, hypothesis, successMetric, controlName, treatmentName } = await request.json();
    if (!name || !type) return NextResponse.json({ error: "Name and type required" }, { status: 400 });

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    // Create experiment
    const { data: experiment, error } = await supabase
      .from("experiments")
      .insert({
        workspace_id: membership.workspace_id,
        series_id: seriesId || null,
        name,
        type,
        hypothesis: hypothesis || null,
        success_metric: successMetric || "retention",
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Create control and treatment variants
    await supabase.from("experiment_variants").insert([
      {
        experiment_id: experiment.id,
        name: controlName || "Control",
        is_control: true,
        traffic_allocation: 50,
      },
      {
        experiment_id: experiment.id,
        name: treatmentName || "Treatment",
        is_control: false,
        traffic_allocation: 50,
      },
    ]);

    return NextResponse.json({ experiment });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
