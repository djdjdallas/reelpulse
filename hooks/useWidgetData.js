"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useWidgetData(widgetType, config) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const seriesId = config?.seriesId;

        switch (widgetType) {
          case "metric_card": {
            if (!seriesId) break;
            const { data: metrics } = await supabase
              .from("episode_metrics")
              .select("views, revenue_cents, unlocks, likes")
              .in("episode_id", await getEpisodeIds(supabase, seriesId));

            const totals = (metrics || []).reduce(
              (acc, m) => ({
                views: acc.views + (m.views || 0),
                revenue: acc.revenue + (m.revenue_cents || 0),
                unlocks: acc.unlocks + (m.unlocks || 0),
                likes: acc.likes + (m.likes || 0),
              }),
              { views: 0, revenue: 0, unlocks: 0, likes: 0 }
            );
            setData(totals);
            break;
          }
          case "revenue_trend":
          case "engagement_trend": {
            if (!seriesId) break;
            const episodeIds = await getEpisodeIds(supabase, seriesId);
            const { data: metrics } = await supabase
              .from("episode_metrics")
              .select("date, views, revenue_cents, likes, comments, shares")
              .in("episode_id", episodeIds)
              .order("date");

            // Group by date
            const byDate = {};
            for (const m of metrics || []) {
              if (!byDate[m.date]) byDate[m.date] = { date: m.date, revenue: 0, views: 0, engagement: 0 };
              byDate[m.date].revenue += m.revenue_cents || 0;
              byDate[m.date].views += m.views || 0;
              byDate[m.date].engagement += (m.likes || 0) + (m.comments || 0) + (m.shares || 0);
            }
            setData(Object.values(byDate));
            break;
          }
          case "experiment_status": {
            const { data: experiments } = await supabase
              .from("experiments")
              .select("id, name, status, type, success_metric")
              .in("status", ["running", "draft"])
              .order("created_at", { ascending: false })
              .limit(5);
            setData(experiments);
            break;
          }
          default:
            setData(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [widgetType, config?.seriesId, config?.metric]);

  return { data, loading, error };
}

async function getEpisodeIds(supabase, seriesId) {
  const { data } = await supabase
    .from("episodes")
    .select("id")
    .eq("series_id", seriesId);
  return (data || []).map((e) => e.id);
}
