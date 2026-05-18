"use client";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Titles",
    color: "#c9a227",
  },
} satisfies ChartConfig;

export function RatingRadarChart({
  items,
  totalRated,
}: {
  items: Array<{ rating: number; count: number }>;
  totalRated: number;
}) {
  const chartData = [
    { star: "1 ★", count: items.find((i) => i.rating === 1)?.count ?? 0 },
    { star: "2 ★", count: items.find((i) => i.rating === 2)?.count ?? 0 },
    { star: "3 ★", count: items.find((i) => i.rating === 3)?.count ?? 0 },
    { star: "4 ★", count: items.find((i) => i.rating === 4)?.count ?? 0 },
    { star: "5 ★", count: items.find((i) => i.rating === 5)?.count ?? 0 },
  ];

  const hasData = chartData.some((d) => d.count > 0);

  return (
    <div className="relative flex h-full min-h-[590px] flex-col rounded-lg border border-white/10 bg-white/[0.02] p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-gray-400">
            Rating Radar
          </p>
          <h4 className="mt-1 text-lg font-semibold text-white">
            1 to 5 star spread
          </h4>
          <p className="mt-1 text-sm text-gray-400">
            How many titles were rated at each star level.
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4 flex flex-1 items-center justify-center">
        {!hasData ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-4xl opacity-20">◎</span>
            <p className="text-sm text-white/30">No ratings yet</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[310px]"
            style={{ minHeight: 280 }}
          >
            <RadarChart data={chartData}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarAngleAxis
                dataKey="star"
                tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
              />
              <PolarGrid stroke="rgba(255,255,255,0.15)" />
              <Radar
                dataKey="count"
                fill="#c9a227"
                fillOpacity={0.6}
                stroke="#c9a227"
                strokeWidth={1.5}
              />
            </RadarChart>
          </ChartContainer>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-col items-center gap-1 text-sm">
        <div className="text-gray-400">
          {totalRated > 0 ? `${totalRated} titles rated` : "No ratings yet"}
        </div>
      </div>
    </div>
  );
}
