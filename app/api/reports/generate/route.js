import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/utils/featureGating";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { seriesId, format, dateFrom, dateTo } = await request.json();

    if (!seriesId || !format || !["csv", "pdf"].includes(format)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Get workspace plan
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id, workspaces(plan)")
      .eq("user_id", user.id)
      .single();

    const plan = membership?.workspaces?.plan ?? "free";

    if (format === "csv" && !hasFeature(plan, "hasCSVExport")) {
      return NextResponse.json({ error: "CSV export requires Pro plan" }, { status: 403 });
    }
    if (format === "pdf" && !hasFeature(plan, "hasPDFExport")) {
      return NextResponse.json({ error: "PDF export requires Studio plan" }, { status: 403 });
    }

    // Fetch series data
    const { data: series } = await supabase
      .from("series")
      .select("*")
      .eq("id", seriesId)
      .single();

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    const { data: episodes } = await supabase
      .from("episodes")
      .select("*")
      .eq("series_id", seriesId)
      .order("episode_number");

    let metricsQuery = supabase
      .from("episode_metrics")
      .select("*")
      .in("episode_id", episodes.map((e) => e.id));

    if (dateFrom) metricsQuery = metricsQuery.gte("date", dateFrom);
    if (dateTo) metricsQuery = metricsQuery.lte("date", dateTo);

    const { data: metrics } = await metricsQuery.order("date");

    if (format === "csv") {
      return generateCSV(series, episodes, metrics || []);
    }

    if (format === "pdf") {
      return await generatePDF(series, episodes, metrics || [], { from: dateFrom, to: dateTo });
    }
  } catch (err) {
    console.error("Report generation error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

function generateCSV(series, episodes, metrics) {
  const headers = [
    "Episode Number",
    "Episode Title",
    "Date",
    "Views",
    "Watch Time (s)",
    "Avg % Watched",
    "Likes",
    "Shares",
    "Comments",
    "Unlocks",
    "Revenue ($)",
  ];

  const rows = metrics.map((m) => {
    const ep = episodes.find((e) => e.id === m.episode_id);
    return [
      ep?.episode_number || "",
      `"${(ep?.title || "").replace(/"/g, '""')}"`,
      m.date,
      m.views,
      m.watch_time_seconds,
      m.avg_percent_watched,
      m.likes,
      m.shares,
      m.comments,
      m.unlocks,
      (m.revenue_cents / 100).toFixed(2),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${series.title}-report.csv"`,
    },
  });
}

async function generatePDF(series, episodes, metrics, dateRange) {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const { SeriesReportDocument } = await import("@/components/reports/pdf/SeriesReportDocument");
  const React = await import("react");

  const doc = React.createElement(SeriesReportDocument, {
    series,
    episodes,
    metrics,
    dateRange,
  });

  const buffer = await renderToBuffer(doc);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${series.title}-report.pdf"`,
    },
  });
}
