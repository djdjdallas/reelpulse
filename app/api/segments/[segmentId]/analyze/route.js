import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { classifyEpisodes, analyzeSegment } from "@/lib/calculations/segmentation";

export async function POST(request, { params }) {
  try {
    const { segmentId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { seriesId } = body;

    // Get the segment
    const { data: segment } = await supabase
      .from("audience_segments")
      .select("*")
      .eq("id", segmentId)
      .single();

    if (!segment) return NextResponse.json({ error: "Segment not found" }, { status: 404 });

    // Get series episodes and metrics
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

    // Classify and analyze
    const segmentEpisodes = classifyEpisodes(segment.type, episodes || [], metrics || []);
    const analysis = analyzeSegment(segmentEpisodes, metrics || [], episodes || []);

    // Upsert analysis results
    const { data: result, error } = await supabase
      .from("segment_analysis")
      .upsert(
        {
          segment_id: segmentId,
          series_id: seriesId,
          ...analysis,
          analyzed_at: new Date().toISOString(),
        },
        { onConflict: "segment_id,series_id" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ analysis: result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
