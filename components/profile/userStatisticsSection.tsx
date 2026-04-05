"use client";

import { useEffect, useState } from "react";
import { Play, Sparkles, Star } from "lucide-react";

import { getUserStatistics } from "@/lib/actions";

type Props = {
  username: string;
};

export default function UserStatisticsSection({ username }: Props) {
  const [stats, setStats] = useState<{
    totalMoviesWatched: number;
    averageRating: string;
    totalHoursWatched: number;
    topGenres: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getUserStatistics(username);
        setStats(data);
      } catch (error) {
        console.error("Failed to load statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [username]);

  if (isLoading) {
    return (
      <div className="mb-8 overflow-hidden rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)]">
        <div className="flex flex-wrap divide-y divide-white/10 xmd:divide-y sm:block">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex min-h-[118px] w-1/4 items-center justify-start border-r border-white/10 px-8 py-6 last:border-r-0 xmd:w-1/2 xmd:border-r-0 xmd:odd:border-r sm:w-full sm:border-r-0"
            >
              <div className="h-14 w-full max-w-[220px] animate-pulse rounded-2xl bg-white/[0.04]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      icon: Play,
      label: "Movies Watched",
      value: stats.totalMoviesWatched.toString(),
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      icon: Star,
      label: "Average Rating",
      value: stats.averageRating,
      color: "bg-yellow-500/20 text-yellow-400",
    },
    {
      icon: Sparkles,
      label: "Hours Watched",
      value:
        stats.totalHoursWatched > 0
          ? `${Math.round(stats.totalHoursWatched)}h`
          : "—",
      color: "bg-purple-500/20 text-purple-400",
    },
    {
      icon: Sparkles,
      label: "Top Genre",
      value: stats.topGenres[0] || "—",
      color: "bg-pink-500/20 text-pink-400",
    },
  ];

  return (
    <div className="mb-8 overflow-hidden rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)]">
      <div className="flex flex-wrap divide-y divide-white/10 xmd:divide-y sm:block">
        {statItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex min-h-[118px] w-1/4 items-center justify-start border-r border-white/10 px-8 py-6 last:border-r-0 xmd:w-1/2 xmd:border-r-0 xmd:odd:border-r sm:w-full sm:border-r-0"
            >
              <div className="flex w-full max-w-[220px] items-center gap-4 text-left">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 ${item.color} bg-white/5`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold leading-none text-white lg:text-[1.6rem] sm:text-2xl">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
