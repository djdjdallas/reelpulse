import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, Clock, DollarSign, Activity } from "lucide-react";

const icons = {
  views: Eye,
  retention: Clock,
  revenue: DollarSign,
  health: Activity,
};

export function StatsOverview({ stats }) {
  const cards = [
    {
      title: "Total Views",
      value: formatNumber(stats?.totalViews ?? 0),
      icon: "views",
      trend: stats?.viewsTrend,
    },
    {
      title: "Avg Retention",
      value: `${(stats?.avgRetention ?? 0).toFixed(1)}%`,
      icon: "retention",
      trend: stats?.retentionTrend,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenueCents ?? 0),
      icon: "revenue",
      trend: stats?.revenueTrend,
    },
    {
      title: "Series Health",
      value: stats?.healthScore != null ? `${stats.healthScore}/100` : "—",
      icon: "health",
      trend: null,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = icons[card.icon];
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.trend != null && (
                <p
                  className={`text-xs mt-1 ${
                    card.trend >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {card.trend >= 0 ? "+" : ""}
                  {card.trend.toFixed(1)}% from last period
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function formatNumber(num) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatCurrency(cents) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
