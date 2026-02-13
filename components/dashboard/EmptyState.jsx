"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Film, Plus, Database } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EmptyState() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLoadSampleData() {
    setLoading(true);
    try {
      const res = await fetch("/api/sample-data", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load sample data");
      toast.success("Sample data loaded successfully!");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Film className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No series yet</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm">
          Create your first series to start tracking episode performance, or
          load sample data to explore the dashboard.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard/series/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Series
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleLoadSampleData}
            disabled={loading}
          >
            <Database className="mr-2 h-4 w-4" />
            {loading ? "Loading..." : "Load Sample Data"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
