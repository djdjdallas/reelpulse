"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const retentionData = [
  { episode: 1, retention: 98 },
  { episode: 2, retention: 95 },
  { episode: 3, retention: 91 },
  { episode: 4, retention: 88 },
  { episode: 5, retention: 85 },
  { episode: 6, retention: 82 },
  { episode: 7, retention: 80 },
  { episode: 8, retention: 78 },
  { episode: 9, retention: 76 },
  { episode: 10, retention: 74 },
  { episode: 11, retention: 72 },
  { episode: 12, retention: 71 },
  { episode: 13, retention: 70 },
  { episode: 14, retention: 69 },
  { episode: 15, retention: 68 },
  { episode: 16, retention: 67 },
  { episode: 17, retention: 66 },
  { episode: 18, retention: 65 },
  { episode: 19, retention: 64 },
  { episode: 20, retention: 63 },
  { episode: 21, retention: 62 },
  { episode: 22, retention: 61 },
  { episode: 23, retention: 60 },
  { episode: 24, retention: 53 },
  { episode: 25, retention: 51 },
  { episode: 26, retention: 52 },
  { episode: 27, retention: 58 },
  { episode: 28, retention: 57 },
  { episode: 29, retention: 56 },
  { episode: 30, retention: 56 },
  { episode: 31, retention: 55 },
  { episode: 32, retention: 55 },
  { episode: 33, retention: 54 },
  { episode: 34, retention: 54 },
  { episode: 35, retention: 53 },
  { episode: 36, retention: 53 },
  { episode: 37, retention: 52 },
  { episode: 38, retention: 52 },
  { episode: 39, retention: 51 },
  { episode: 40, retention: 51 },
  { episode: 41, retention: 50 },
  { episode: 42, retention: 50 },
  { episode: 43, retention: 49 },
  { episode: 44, retention: 49 },
  { episode: 45, retention: 48 },
  { episode: 46, retention: 48 },
  { episode: 47, retention: 47 },
  { episode: 48, retention: 47 },
  { episode: 49, retention: 46 },
  { episode: 50, retention: 45 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "8px",
        padding: "8px 12px",
        color: "#f8fafc",
        fontSize: "13px",
      }}
    >
      <p className="font-medium">Episode {label}</p>
      <p className="text-blue-400">{payload[0].value}% retention</p>
    </div>
  );
}

export function SeriesRetentionCard() {
  return (
    <Card className="relative overflow-visible">
      {/* Drop-off Alert Overlay */}
      <div className="absolute -top-3 -right-3 z-10 flex items-start gap-2 rounded-lg border border-orange-500/30 bg-orange-950/80 px-3 py-2 shadow-lg backdrop-blur-sm max-w-[200px]">
        <AlertTriangle className="h-4 w-4 shrink-0 text-orange-400 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-orange-300">Drop-off Alert</p>
          <p className="text-[11px] leading-tight text-orange-200/70">
            Unusual dip at Ep 25. Consider checking the cliffhanger.
          </p>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-base">Series Retention</CardTitle>
        <CardDescription>Viewer retention across 50 episodes</CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={retentionData}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="heroRetentionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />
            <XAxis
              dataKey="episode"
              ticks={[1, 10, 20, 30, 40, 50]}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="retention"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#heroRetentionGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#3b82f6",
                stroke: "#1e293b",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Bottom Stats Row */}
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4 text-center text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Hook Score</p>
            <p className="font-semibold">92/100</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Retention (Ep 10)</p>
            <p className="font-semibold">70%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Opt. Paywall</p>
            <p className="font-semibold text-orange-400">Ep 18</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
