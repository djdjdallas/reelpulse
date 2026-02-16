"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, Users, Activity, Eye, BarChart3 } from "lucide-react";

const PERIODS = [
  { value: 1, label: "24h" },
  { value: 3, label: "3d" },
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
];

const EVENT_CATEGORIES = {
  Auth: [
    "sign_up",
    "sign_in",
    "sign_out",
    "login",
    "logout",
    "password_reset",
  ],
  Onboarding: ["onboarding_started", "onboarding_completed", "onboarding_step"],
  Series: [
    "series_created",
    "series_updated",
    "series_deleted",
    "series_viewed",
  ],
  Episodes: [
    "episode_created",
    "episode_updated",
    "episode_deleted",
    "episode_viewed",
  ],
  Metrics: ["metrics_viewed", "metrics_exported", "metrics_filtered"],
  Billing: [
    "checkout_started",
    "subscription_created",
    "subscription_cancelled",
    "plan_changed",
  ],
  Optimizer: [
    "optimizer_run",
    "optimizer_suggestion_applied",
    "optimizer_viewed",
  ],
  Error: ["error", "$exception", "api_error"],
  Auto: ["$pageview", "$pageleave", "$autocapture", "$rageclick"],
};

function getEventCategory(eventName) {
  for (const [category, events] of Object.entries(EVENT_CATEGORIES)) {
    if (events.some((e) => eventName.toLowerCase().includes(e.toLowerCase()))) {
      return category;
    }
  }
  return "Other";
}

const CATEGORY_COLORS = {
  Auth: "default",
  Onboarding: "secondary",
  Series: "outline",
  Episodes: "outline",
  Metrics: "secondary",
  Billing: "default",
  Optimizer: "secondary",
  Error: "destructive",
  Auto: "ghost",
  Other: "outline",
};

function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDay(day) {
  const d = new Date(day + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AdminDashboard() {
  const [period, setPeriod] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: p }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  const todayDAU =
    data?.dau?.length > 0 ? data.dau[data.dau.length - 1].unique_users : 0;
  const totalEvents =
    data?.events?.reduce((sum, e) => sum + e.count, 0) ?? 0;
  const pageviews =
    data?.events?.find((e) => e.event === "$pageview")?.count ?? 0;

  const chartData =
    data?.dau?.map((d) => ({
      day: formatDay(d.day),
      users: d.unique_users,
    })) ?? [];

  // Top 10 events for bar chart (exclude $pageview/$pageleave for readability)
  const barData =
    data?.events
      ?.filter((e) => e.event !== "$pageview" && e.event !== "$pageleave")
      .slice(0, 10)
      .map((e) => ({
        event: e.event.replace(/^\$/, ""),
        count: e.count,
      })) ?? [];

  return (
    <div className="space-y-6">
      {/* Period Filters */}
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <Button
            key={p.value}
            variant={period === p.value ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard
          title="DAU Today"
          value={todayDAU}
          icon={Users}
          loading={loading}
        />
        <StatsCard
          title="WAU"
          value={data?.wau ?? 0}
          icon={Activity}
          loading={loading}
        />
        <StatsCard
          title="Total Events"
          value={totalEvents}
          icon={BarChart3}
          loading={loading}
        />
        <StatsCard
          title="Pageviews"
          value={pageviews}
          icon={Eye}
          loading={loading}
        />
      </div>

      {/* DAU Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No data for this period
            </p>
          )}
        </CardContent>
      </Card>

      {/* Event Breakdown + Referrers */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Event Breakdown Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Event Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    type="category"
                    dataKey="event"
                    width={120}
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No events for this period
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Referrers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data?.referrers?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.referrers.map((r) => (
                    <TableRow key={r.domain}>
                      <TableCell className="font-medium">
                        {r.domain}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(r.count)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No referrer data
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : data?.events?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.events.map((e) => {
                  const category = getEventCategory(e.event);
                  return (
                    <TableRow key={e.event}>
                      <TableCell className="font-mono text-xs">
                        {e.event}
                      </TableCell>
                      <TableCell>
                        <Badge variant={CATEGORY_COLORS[category] ?? "outline"}>
                          {category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(e.count)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No events for this period
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, loading }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="mt-1 h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{formatNumber(value)}</p>
            )}
          </div>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
