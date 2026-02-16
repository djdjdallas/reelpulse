import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request, { params }) {
  try {
    const { seriesId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: links } = await supabase
      .from("platform_links")
      .select("*")
      .eq("series_id", seriesId)
      .order("platform");

    return NextResponse.json({ links: links || [] });
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

    const { platform, platform_url, title_on_platform, platform_series_id } = await request.json();
    if (!platform) return NextResponse.json({ error: "Platform required" }, { status: 400 });

    const { data, error } = await supabase
      .from("platform_links")
      .upsert(
        {
          series_id: seriesId,
          platform,
          platform_url: platform_url || null,
          title_on_platform: title_on_platform || null,
          platform_series_id: platform_series_id || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "series_id,platform" }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ link: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { linkId } = await request.json();
    const { error } = await supabase
      .from("platform_links")
      .delete()
      .eq("id", linkId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
