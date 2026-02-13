import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Clock } from "lucide-react";

export function SeriesCard({ series }) {
  const updatedAt = new Date(series.updated_at).toLocaleDateString();

  return (
    <Link href={`/dashboard/series/${series.id}`}>
      <Card className="transition-colors hover:border-primary/50 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-semibold line-clamp-1">
              {series.title}
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {series.genre && (
              <Badge variant="secondary" className="text-xs">
                {series.genre}
              </Badge>
            )}
            {series.platform && (
              <Badge variant="outline" className="text-xs">
                {series.platform}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Film className="h-3.5 w-3.5" />
              <span>
                {series.total_episodes || 0} episode
                {series.total_episodes !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{updatedAt}</span>
            </div>
          </div>
          {series.paywall_episode && (
            <div className="mt-2 text-xs text-muted-foreground">
              Paywall at episode {series.paywall_episode}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
