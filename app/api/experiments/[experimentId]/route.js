import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const variantIds = (variants || []).map((v) => v.id);
    const { data: metrics } = await supabase
      .from("experiment_metrics")
      .select("*")
      .in("variant_id", variantIds.length ? variantIds : ["none"])
      .order("date");

    return NextResponse.json({
      experiment,
      variants: variants || [],
      metrics: metrics || [],
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { experimentId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Handle status update
    if (body.status) {
      const { error } = await supabase
        .from("experiments")
        .update({ status: body.status, updated_at: new Date().toISOString() })
        .eq("id", experimentId);
      if (error) throw error;
    }

    // Handle metrics entry
    if (body.metrics) {
      for (const m of body.metrics) {
        await supabase
          .from("experiment_metrics")
          .upsert(
            {
              variant_id: m.variantId,
              date: m.date,
              sample_size: m.sample_size || 0,
              views: m.views || 0,
              avg_retention: m.avg_retention || 0,
              unlocks: m.unlocks || 0,
              revenue_cents: m.revenue_cents || 0,
            },
            { onConflict: "variant_id,date" }
          );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { experimentId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase
      .from("experiments")
      .delete()
      .eq("id", experimentId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
