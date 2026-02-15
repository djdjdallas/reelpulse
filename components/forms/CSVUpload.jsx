"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseMetricsCSV } from "@/lib/utils/csvParser";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import posthog from "posthog-js";

export function CSVUpload({ episodes, onImported }) {
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState(null); // { rows, errors }
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }

    const result = await parseMetricsCSV(file, episodes);
    setParsed(result);
    posthog.capture("csv_uploaded", { row_count: result.rows.length, error_count: result.errors.length });

    if (result.errors.length > 0) {
      toast.error(`${result.errors.length} validation error(s) found`);
    } else {
      toast.success(`${result.rows.length} rows parsed successfully`);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    handleFile(file);
  }

  async function handleImport() {
    if (!parsed?.rows.length) return;

    setImporting(true);
    const supabase = createClient();

    // Remove episode_number from rows before inserting (not a DB column)
    const dbRows = parsed.rows.map(({ episode_number, ...rest }) => rest);

    const { data, error } = await supabase
      .from("episode_metrics")
      .upsert(dbRows, { onConflict: "episode_id,date" })
      .select();

    setImporting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    posthog.capture("csv_import_completed", { rows_imported: data.length });
    toast.success(`Imported ${data.length} metric rows`);
    setParsed(null);
    onImported?.(data);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">CSV Upload</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a href="/csv-template.csv" download>
              <FileText className="mr-2 h-4 w-4" />
              Download Template
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Drag & drop a CSV file here, or click to browse
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Validation errors */}
        {parsed?.errors.length > 0 && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertCircle className="h-4 w-4" />
              {parsed.errors.length} validation error(s)
            </div>
            <ul className="list-disc pl-6 text-xs text-destructive/80 space-y-1 max-h-32 overflow-y-auto">
              {parsed.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Preview table */}
        {parsed?.rows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>{parsed.rows.length} rows ready to import</span>
              </div>
              <Button
                onClick={handleImport}
                disabled={importing}
                size="sm"
              >
                {importing
                  ? "Importing..."
                  : `Import ${parsed.rows.length} Rows`}
              </Button>
            </div>

            <div className="rounded-md border overflow-x-auto max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ep #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Watch %</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.rows.slice(0, 20).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.episode_number}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.views.toLocaleString()}</TableCell>
                      <TableCell>{row.avg_percent_watched}%</TableCell>
                      <TableCell>{row.likes}</TableCell>
                      <TableCell>
                        ${(row.revenue_cents / 100).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {parsed.rows.length > 20 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-xs text-muted-foreground"
                      >
                        ... and {parsed.rows.length - 20} more rows
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
