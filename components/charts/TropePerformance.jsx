"use client";

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

export function TropePerformance({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trope Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No trope data available
        </CardContent>
      </Card>
    );
  }

  // Sort by avg retention descending
  const sorted = [...data].sort((a, b) => b.avgRetention - a.avgRetention);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trope Performance</CardTitle>
        <p className="text-xs text-muted-foreground">
          Average retention and views grouped by trope tag
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trope</TableHead>
                <TableHead className="text-right">Episodes</TableHead>
                <TableHead className="text-right">Avg Retention</TableHead>
                <TableHead className="text-right">Avg Views</TableHead>
                <TableHead className="text-right">Total Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => (
                <TableRow key={row.trope}>
                  <TableCell>
                    <Badge variant="outline">{row.trope}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{row.episodeCount}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        row.avgRetention >= 70
                          ? "text-success"
                          : row.avgRetention >= 50
                          ? "text-warning"
                          : "text-destructive"
                      }
                    >
                      {row.avgRetention.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {Math.round(row.avgViews).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.totalViews.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
