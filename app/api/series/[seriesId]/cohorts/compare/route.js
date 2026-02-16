import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request, { params }) {
  try {
    const { seriesId } = await params;
    const { searchParams } = new URL(request.url);
    const cohortIds = searchParams.get("ids")?.split(",").filter(Boolean) || [];

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!cohortIds.length) {
      return NextResponse.json({ error: "No cohort IDs provided" }, { status: 400 });
    }

    const results = [];
    for (const id of cohortIds) {
      const { data: retention } = await supabase
        .from("cohort_retention")
        .select("*")
        .eq("cohort_id", id)
        .order("episode_number");

      results.push({ cohortId: id, retention: retention || [] });
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
