import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/utils/featureGating";
import { ReportBuilder } from "@/components/reports/ReportBuilder";
import { ReportTemplateList } from "@/components/reports/ReportTemplateList";
import { ReportHistory } from "@/components/reports/ReportHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Reports — Reelytics" };

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(plan)")
    .eq("user_id", user.id)
    .single();

  const plan = membership?.workspaces?.plan ?? "free";

  if (!hasFeature(plan, "hasCSVExport")) {
    redirect("/dashboard/settings/billing");
  }

  const hasPDFExport = hasFeature(plan, "hasPDFExport");
  const hasReportTemplates = hasFeature(plan, "hasReportTemplates");

  const { data: templates } = hasReportTemplates
    ? await supabase
        .from("report_templates")
        .select("*")
        .eq("workspace_id", membership.workspace_id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const { data: reports } = await supabase
    .from("generated_reports")
    .select("*")
    .eq("workspace_id", membership.workspace_id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Generate and export reports for your series data.
        </p>
      </div>

      <ReportBuilder hasPDFExport={hasPDFExport} hasReportTemplates={hasReportTemplates} />

      {hasReportTemplates && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saved Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportTemplateList templates={templates || []} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report History</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportHistory reports={reports || []} />
        </CardContent>
      </Card>
    </div>
  );
}
