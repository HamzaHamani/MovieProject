"use client";

import { cn } from "@/lib/utils";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { RatingRadarChart } from "../animata/graphs/film-commit-graph";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface FilmCommitGraphProps {
  loggedMovies: Array<{
    createdAt: Date | string | null;
    id: string;
    showId?: string;
    rating?: number | null;
    title?: string;
    posterPath?: string | null;
    href?: string;
    mediaTypeLabel?: "Movie" | "TV Show";
  }>;
  mediaMap?: Record<
    string,
    {
      id: string;
      title: string;
      posterPath: string | null;
      href: string;
      mediaTypeLabel: "Movie" | "TV Show";
    } | null
  >;
}

type HoveredDay = {
  dateKey: string;
  label: string;
  x: number;
  y: number;
  posters: Array<{
    id: string;
    title: string;
    posterPath: string | null;
    href: string;
    mediaTypeLabel: "Movie" | "TV Show";
  }>;
};

const getColor = (count: number): string => {
  if (count === 0) return "bg-white/10";
  if (count === 1) return "bg-primaryM-500/30";
  if (count === 2) return "bg-primaryM-400/50";
  if (count === 3) return "bg-primaryM-400/70";
  return "bg-primaryM-400";
};

function getTooltipText(count: number, date: string): string {
  if (count === 0) return `No titles logged on ${date}`;
  return `${count} title${count === 1 ? "" : "s"} logged on ${date}`;
}

export default function FilmCommitGraph({
  loggedMovies,
  mediaMap,
}: FilmCommitGraphProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<HoveredDay | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelMounted, setPanelMounted] = useState(false);
  const [postersLoading, setPostersLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    loggedMovies.forEach((movie) => {
      if (!movie.createdAt) return;
      const date = new Date(movie.createdAt);
      years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [loggedMovies]);

  const movieCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    const filteredMovies = selectedYear
      ? loggedMovies.filter((movie) => {
          if (!movie.createdAt) return false;
          const date = new Date(movie.createdAt);
          return date.getFullYear() === selectedYear;
        })
      : loggedMovies;

    filteredMovies.forEach((movie) => {
      if (!movie.createdAt) return;
      const date = new Date(movie.createdAt);
      const dateStr = date.toISOString().split("T")[0];
      map.set(dateStr, (map.get(dateStr) ?? 0) + 1);
    });
    return map;
  }, [loggedMovies, selectedYear]);

  const moviesByDate = useMemo(() => {
    const map = new Map<
      string,
      Array<{
        id: string;
        title: string;
        posterPath: string | null;
        href: string;
        mediaTypeLabel: "Movie" | "TV Show";
      }>
    >();

    const filteredMovies = selectedYear
      ? loggedMovies.filter((movie) => {
          if (!movie.createdAt) return false;
          const date = new Date(movie.createdAt);
          return date.getFullYear() === selectedYear;
        })
      : loggedMovies;

    filteredMovies.forEach((movie) => {
      if (!movie.createdAt) return;
      const date = new Date(movie.createdAt);
      const dateStr = date.toISOString().split("T")[0];
      const current = map.get(dateStr) ?? [];

      const resolved = movie.showId ? mediaMap?.[movie.showId] ?? null : null;

      current.push({
        id: movie.id,
        title: movie.title ?? resolved?.title ?? "Title unavailable",
        posterPath: movie.posterPath ?? resolved?.posterPath ?? null,
        href: movie.href ?? resolved?.href ?? "#",
        mediaTypeLabel:
          movie.mediaTypeLabel ?? resolved?.mediaTypeLabel ?? "Movie",
      });

      map.set(dateStr, current);
    });

    return map;
  }, [loggedMovies, selectedYear]);

  const today = new Date();
  const weeksData: Array<{ counts: number[]; dates: Date[] }> = [];
  const currentDate = new Date(today);
  const dayOfWeek = currentDate.getDay();
  const recentSunday = new Date(currentDate);
  recentSunday.setDate(currentDate.getDate() - dayOfWeek);

  for (let week = 51; week >= 0; week--) {
    const weekData: number[] = [];
    const weekDates: Date[] = [];
    const weekStart = new Date(recentSunday);
    weekStart.setDate(recentSunday.getDate() - week * 7);

    for (let day = 0; day < 7; day++) {
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + day);
      const dateStr = currentDay.toISOString().split("T")[0];
      weekData.push(movieCountByDate.get(dateStr) ?? 0);
      weekDates.push(currentDay);
    }

    weeksData.push({ counts: weekData, dates: weekDates });
  }

  const monthLabelByWeek = new Map<number, string>();
  weeksData.forEach((weekData, index) => {
    const firstDate = weekData.dates[0];
    if (!firstDate) return;

    if (index === 0) {
      monthLabelByWeek.set(
        index,
        firstDate.toLocaleDateString("en-US", { month: "short" }),
      );
      return;
    }

    const previousFirstDate = weeksData[index - 1]?.dates[0];
    if (!previousFirstDate) return;

    if (firstDate.getMonth() !== previousFirstDate.getMonth()) {
      monthLabelByWeek.set(
        index,
        firstDate.toLocaleDateString("en-US", { month: "short" }),
      );
    }
  });

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];
  const hoveredCount = hoveredDay?.posters.length ?? 0;

  const ratingDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    loggedMovies.forEach((movie) => {
      const rating = Number(movie.rating);
      if (!rating || rating <= 0 || rating > 5) return;
      const bucket = Math.min(5, Math.max(1, Math.round(rating)));
      counts[bucket - 1] += 1;
    });

    // ✅ Move logs here, outside the loop
    console.log(
      "ratings raw:",
      loggedMovies.map((m) => ({ r: m.rating, type: typeof m.rating })),
    );
    console.log("ratingDistribution result:", counts);

    return counts.map((count, index) => ({ rating: index + 1, count }));
  }, [loggedMovies]);

  const totalRatedMovies = ratingDistribution.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  useEffect(() => {
    if (hoveredDay) {
      setPanelMounted(true);
      setPostersLoading(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setPanelVisible(true)),
      );
      const loadTimer = window.setTimeout(() => setPostersLoading(false), 300);
      return () => window.clearTimeout(loadTimer);
      return;
    }
    setPanelVisible(false);
    const timer = window.setTimeout(() => setPanelMounted(false), 180);
    return () => window.clearTimeout(timer);
  }, [hoveredDay]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    const scrollToEnd = () => {
      scrollContainer.scrollLeft = scrollContainer.scrollWidth;
    };
    scrollToEnd();
    const resizeObserver = new ResizeObserver(() => scrollToEnd());
    resizeObserver.observe(scrollContainer);
    return () => resizeObserver.disconnect();
  }, [loggedMovies, selectedYear]);

  return (
    <div className="flex flex-row flex-wrap gap-6 lg:flex-col">
      <section className="flex h-full w-full min-w-0 flex-[1.35] flex-col gap-2">
        <div className="relative rounded-lg border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">
              Viewing Activity
            </h3>
            {availableYears.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedYear(null)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    selectedYear === null
                      ? "border-primaryM-500 bg-primaryM-500 text-black"
                      : "border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                  }`}
                >
                  All Years
                </button>
                {availableYears.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectedYear(year)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      selectedYear === year
                        ? "border-primaryM-500 bg-primaryM-500 text-black"
                        : "border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            ref={scrollContainerRef}
            className="flex justify-center overflow-x-auto"
          >
            <div className="min-w-fit">
              <div className="mb-2 ml-8 flex gap-1 text-[10px] text-gray-500">
                {weeksData.map((_, weekIndex) => (
                  <div
                    key={`month-${weekIndex}`}
                    className="h-3 w-3 overflow-visible whitespace-nowrap"
                  >
                    {monthLabelByWeek.get(weekIndex) ?? ""}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col gap-1 pt-0.5 text-[10px] text-gray-500">
                  {dayLabels.map((label, idx) => (
                    <div key={`label-${idx}`} className="h-3 leading-3">
                      {label}
                    </div>
                  ))}
                </div>

                <div className="flex gap-1">
                  {weeksData.map((week, weekIndex) => (
                    <div
                      key={`week-${weekIndex}`}
                      className="flex flex-col gap-1"
                    >
                      {week.counts.map((count, dayIndex) => {
                        const currentDay = week.dates[dayIndex];
                        const dateStr = currentDay.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });

                        return (
                          <div
                            key={`day-${weekIndex}-${dayIndex}`}
                            className={cn(
                              "group/tooltip relative h-3 w-3 cursor-pointer rounded-sm transition-transform duration-200 hover:scale-110",
                              getColor(count),
                            )}
                            onMouseEnter={(event) => {
                              const current =
                                event.currentTarget.getBoundingClientRect();
                              const container = event.currentTarget
                                .closest("section")
                                ?.getBoundingClientRect();
                              const posters =
                                moviesByDate.get(
                                  currentDay.toISOString().split("T")[0],
                                ) ?? [];
                              setHoveredDay({
                                dateKey: currentDay.toISOString().split("T")[0],
                                label: dateStr,
                                x:
                                  current.left -
                                  (container?.left ?? 0) +
                                  current.width / 2,
                                y: current.bottom - (container?.top ?? 0) + 12,
                                posters,
                              });
                            }}
                            onMouseMove={(event) => {
                              const current =
                                event.currentTarget.getBoundingClientRect();
                              const container = event.currentTarget
                                .closest("section")
                                ?.getBoundingClientRect();
                              setHoveredDay((previous) =>
                                previous?.dateKey ===
                                currentDay.toISOString().split("T")[0]
                                  ? {
                                      ...previous,
                                      x:
                                        current.left -
                                        (container?.left ?? 0) +
                                        current.width / 2,
                                      y:
                                        current.bottom -
                                        (container?.top ?? 0) +
                                        12,
                                    }
                                  : previous,
                              );
                            }}
                            onMouseLeave={() => setHoveredDay(null)}
                            aria-label={getTooltipText(count, dateStr)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {panelMounted && hoveredDay ? (
            <div
              className={cn(
                "duration-180 pointer-events-none absolute z-30 w-[320px] -translate-x-1/2 transition-all ease-out",
                panelVisible
                  ? "scale-100 opacity-100"
                  : "translate-y-2 scale-[0.98] opacity-0",
              )}
              style={{ left: hoveredDay.x, top: hoveredDay.y }}
            >
              <div className="rounded-2xl border border-white/10 bg-[#111114] p-3 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                    {hoveredDay.label}
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/60">
                    {hoveredCount} logged
                  </span>
                </div>
                {hoveredDay.posters.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {hoveredDay.posters.slice(0, 8).map((movie) => (
                      <a
                        key={movie.id}
                        href={movie.href}
                        className="group/movie block min-w-[64px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
                      >
                        <div className="relative aspect-[2/3]">
                          {movie.posterPath ? (
                            <LazyBlurImage
                              src={`https://image.tmdb.org/t/p/w342/${movie.posterPath}`}
                              alt={movie.title}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover/movie:scale-105"
                              placeholderClassName="bg-zinc-700/50"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-white/[0.05] px-1 text-center text-[10px] text-gray-400">
                              No poster
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                            <p className="line-clamp-2 text-[9px] font-medium text-white">
                              {movie.title}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : postersLoading ? (
                  <div className="gap- grid grid-cols-4">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={`skeleton-${idx}`}
                        className="f block h-16 w-10 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]"
                      >
                        <div className="relative aspect-[2/3]">
                          <div className="h-full w-full animate-pulse bg-zinc-700/30" />
                          <div className="absolute inset-x-0 bottom-0 p-2">
                            <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-700/20" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    No films logged that day.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-end gap-2 text-xs text-gray-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-white/10" />
              <div className="h-2.5 w-2.5 rounded-sm bg-primaryM-500/30" />
              <div className="h-2.5 w-2.5 rounded-sm bg-primaryM-400/50" />
              <div className="h-2.5 w-2.5 rounded-sm bg-primaryM-400/70" />
              <div className="h-2.5 w-2.5 rounded-sm bg-primaryM-400" />
            </div>
            <span>More</span>
          </div>
        </div>
        <ActivityAreaChart loggedMovies={loggedMovies} />
      </section>

      <div className="h-full w-full flex-1 lg:w-full">
        <RatingRadarChart
          items={ratingDistribution}
          totalRated={totalRatedMovies}
        />
      </div>
    </div>
  );
}
const areaChartConfig = {
  movies: {
    label: "Movies",
    color: "#f5cf4d",
  },
  tvShows: {
    label: "TV Shows",
    color: "#2dd4bf",
  },
} satisfies ChartConfig;

function ActivityAreaChart({
  loggedMovies,
}: {
  loggedMovies: FilmCommitGraphProps["loggedMovies"];
}) {
  const [timeRange, setTimeRange] = React.useState("7d");
  const chartData = useMemo(() => {
    const map = new Map<string, { movies: number; tvShows: number }>();

    loggedMovies.forEach((item) => {
      if (!item.createdAt) return;
      const date = new Date(item.createdAt).toISOString().split("T")[0];
      const current = map.get(date) ?? { movies: 0, tvShows: 0 };
      if (item.mediaTypeLabel === "TV Show") {
        current.tvShows += 1;
      } else {
        current.movies += 1;
      }
      map.set(date, current);
    });

    // ✅ Always fill ALL days in the last 90 days with 0s so the chart
    // has a full baseline — even days with no activity get an entry.
    // This prevents recharts from rendering nothing on sparse data.
    const result: Array<{ date: string; movies: number; tvShows: number }> = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      result.push({
        date: key,
        movies: map.get(key)?.movies ?? 0,
        tvShows: map.get(key)?.tvShows ?? 0,
      });
    }

    return result;
  }, [loggedMovies]);
  // Fix the filter
  const filteredData = useMemo(() => {
    return chartData.filter((item) => {
      const date = new Date(item.date + "T00:00:00"); // ✅ force local midnight
      const daysToSubtract =
        timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // ✅ normalize to midnight
      startDate.setDate(startDate.getDate() - daysToSubtract);
      return date >= startDate;
    });
  }, [chartData, timeRange]); // ✅ wrap in useMemo with proper deps

  return (
    <div className="relative rounded-lg border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Daily activity</h3>
          <p className="mt-1 text-xs text-gray-400">
            Daily counts of movies and TV shows you've logged.
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px] rounded-lg border-white/10 bg-white/[0.04] text-xs text-white">
            <SelectValue placeholder="Last 7 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-white/10 bg-[#0d0c0f]">
            <SelectItem
              value="90d"
              className="text-white focus:bg-primaryM-900/60 focus:text-white"
            >
              Last 3 months
            </SelectItem>
            <SelectItem
              value="30d"
              className="text-white focus:bg-primaryM-900/60 focus:text-white"
            >
              Last 30 days
            </SelectItem>
            <SelectItem
              value="7d"
              className="text-white focus:bg-primaryM-900/60 focus:text-white"
            >
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ChartContainer
        config={areaChartConfig}
        className="aspect-auto h-[220px] w-full"
      >
        <AreaChart data={filteredData}>
          <defs>
            <linearGradient id="fillMovies" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c9a227" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#c9a227" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillTvShows" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.5} />{" "}
              <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />

          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />

          <ChartTooltip
            cursor={{ stroke: "rgba(255,255,255,0.1)" }}
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                }
                indicator="dot"
              />
            }
          />

          <Area
            dataKey="tvShows"
            type="monotone" // ✅ no dipping below baseline
            fill="url(#fillTvShows)"
            stroke="#2dd4bf"
            strokeWidth={1.5}
            stackId="a"
          />
          <Area
            dataKey="movies"
            type="monotone" // ✅ no dipping below baseline
            fill="url(#fillMovies)"
            stroke="#f5cf4d"
            strokeWidth={1.5}
            stackId="a"
          />

          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
