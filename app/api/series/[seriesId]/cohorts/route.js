import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCohortDefinitions, calculateCohortRetention } from "@/lib/calculations/cohortAnalysis";

export async function GET(request, { params }) {
  try {
    const { seriesId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: cohorts } = await supabase
      .from("cohorts")
      .select("*")
      .eq("series_id", seriesId)
      .order("date_from");

    // Get retention data for each cohort
    const retentionData = [];
    for (const cohort of (cohorts || [])) {
      const { data: retention } = await supabase
        .from("cohort_retention")
        .select("*")
        .eq("cohort_id", cohort.id)
        .order("episode_number");

      retentionData.push({
        cohortId: cohort.id,
        retention: retention || [],
      });
    }

    return NextResponse.json({ cohorts: cohorts || [], retentionData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { seriesId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { type, name, dateFrom, dateTo } = body;

    // Get series and episodes
    const { data: series } = await supabase
      .from("series")
      .select("*")
      .eq("id", seriesId)
      .single();

    const { data: episodes } = await supabase
      .from("episodes")
      .select("*")
      .eq("series_id", seriesId)
      .order("episode_number");

    const episodeIds = (episodes || []).map((e) => e.id);
    const { data: metrics } = await supabase
      .from("episode_metrics")
      .select("*")
      .in("episode_id", episodeIds.length ? episodeIds : ["none"]);

    if (type === "custom") {
      // Create single custom cohort
      const { data: cohort, error } = await supabase
        .from("cohorts")
        .insert({ series_id: seriesId, name, type: "custom", date_from: dateFrom, date_to: dateTo })
        .select()
        .single();

      if (error) throw error;

      // Calculate retention
      const retention = calculateCohortRetention(episodes || [], metrics || [], dateFrom, dateTo);
      if (retention.length) {
        await supabase.from("cohort_retention").insert(
          retention.map((r) => ({
            cohort_id: cohort.id,
            episode_number: r.episode_number,
            retention_pct: r.retention_pct,
            views: r.views,
          }))
        );
      }

      return NextResponse.json({ cohort, count: 1 });
    }

    // Auto-generate cohorts
    const definitions = generateCohortDefinitions(type, series, episodes || [], metrics || []);
    if (!definitions.length) {
      return NextResponse.json({ error: "No data available to generate cohorts" }, { status: 400 });
    }

    let count = 0;
    for (const def of definitions) {
      const { data: cohort, error } = await supabase
        .from("cohorts")
        .insert({
          series_id: seriesId,
          name: def.name,
          type: def.type,
          date_from: def.date_from,
          date_to: def.date_to,
        })
        .select()
        .single();

      if (error) continue;

      const retention = calculateCohortRetention(episodes || [], metrics || [], def.date_from, def.date_to);
      if (retention.length) {
        await supabase.from("cohort_retention").insert(
          retention.map((r) => ({
            cohort_id: cohort.id,
            episode_number: r.episode_number,
            retention_pct: r.retention_pct,
            views: r.views,
          }))
        );
      }
      count++;
    }

    return NextResponse.json({ count });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
