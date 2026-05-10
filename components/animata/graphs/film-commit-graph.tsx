"use client";

import { cn } from "@/lib/utils";

interface FilmCommitGraphProps {
  loggedMovies: Array<{
    createdAt: Date | string | null;
    id: string;
  }>;
}

const getColor = (count: number): string => {
  if (count === 0) return "bg-white/10";
  if (count === 1) return "bg-primaryM-500/30";
  if (count === 2) return "bg-primaryM-400/50";
  if (count === 3) return "bg-primaryM-400/70";
  return "bg-primaryM-400";
};

function getTooltipText(count: number, date: string): string {
  if (count === 0) return `No films logged on ${date}`;
  return `${count} film${count === 1 ? "" : "s"} logged on ${date}`;
}

export default function FilmCommitGraph({
  loggedMovies,
}: FilmCommitGraphProps) {
  // Count movies logged by date
  const movieCountByDate = new Map<string, number>();

  loggedMovies.forEach((movie) => {
    if (!movie.createdAt) return; // Skip null dates
    const date = new Date(movie.createdAt);
    const dateStr = date.toISOString().split("T")[0];
    movieCountByDate.set(dateStr, (movieCountByDate.get(dateStr) ?? 0) + 1);
  });

  // Generate 52 weeks of data (looking back from today)
  const today = new Date();
  const weeksData: number[][] = [];

  // Find the most recent Sunday before today
  const currentDate = new Date(today);
  const dayOfWeek = currentDate.getDay();
  const recentSunday = new Date(currentDate);
  recentSunday.setDate(currentDate.getDate() - dayOfWeek);

  // Generate 52 weeks
  for (let week = 51; week >= 0; week--) {
    const weekData: number[] = [];
    const weekStart = new Date(recentSunday);
    weekStart.setDate(recentSunday.getDate() - week * 7);

    for (let day = 0; day < 7; day++) {
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + day);
      const dateStr = currentDay.toISOString().split("T")[0];
      weekData.push(movieCountByDate.get(dateStr) ?? 0);
    }

    weeksData.push(weekData);
  }

  return (
    <section className="w-full">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">
          Film Logging Activity
        </h3>
        <div className="overflow-x-auto">
          <div className="flex min-w-fit gap-1">
            {weeksData.map((week, weekIndex) => (
              <div
                key={`week-${weekIndex}`}
                className="flex flex-col gap-1"
              >
                {week.map((count, dayIndex) => {
                  const weekStart = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate() - (51 - weekIndex) * 7 + dayIndex
                  );
                  const dateStr = weekStart.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={`day-${weekIndex}-${dayIndex}`}
                      className={cn(
                        "group/tooltip relative h-3 w-3 cursor-pointer rounded-sm transition-transform duration-200 hover:scale-110 md:h-4 md:w-4",
                        getColor(count)
                      )}
                      title={getTooltipText(count, dateStr)}
                    >
                      {/* Hover tooltip */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity duration-200 group-hover/tooltip:opacity-100 whitespace-nowrap">
                        {getTooltipText(count, dateStr)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
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
    </section>
  );
}
