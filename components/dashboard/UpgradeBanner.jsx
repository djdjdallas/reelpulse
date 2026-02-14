import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle } from "lucide-react";

export function UpgradeBanner({ message }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center gap-4 py-6">
        <ArrowUpCircle className="h-8 w-8 shrink-0 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/settings/billing">Upgrade</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
