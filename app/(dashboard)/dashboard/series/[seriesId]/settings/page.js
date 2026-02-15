import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SeriesForm } from "@/components/forms/SeriesForm";

export const metadata = {
  title: "Series Settings — Reelytics",
};

export default async function SeriesSettingsPage({ params }) {
  const { seriesId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: series } = await supabase
    .from("series")
    .select("*")
    .eq("id", seriesId)
    .single();

  if (!series) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{series.title} — Settings</h1>
        <p className="text-sm text-muted-foreground">
          Edit series details
        </p>
      </div>
      <SeriesForm workspaceId={series.workspace_id} initialData={series} />
    </div>
  );
}
