"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type UpcomingMovie = {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

type UpcomingResponse = {
  dates: {
    maximum: string;
    minimum: string;
  };
  page: number;
  total_pages: number;
  total_results: number;
  results: UpcomingMovie[];
};

type DateWindow = {
  minimum: string;
  maximum: string;
};

function toMonthLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function formatMonthLong(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(parsed);
}

function formatDay(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return String(parsed.getDate()).padStart(2, "0");
}

function formatRange(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateWindow(movies: UpcomingMovie[]): DateWindow | null {
  if (!movies.length) {
    return null;
  }

  const sorted = [...movies].sort((a, b) =>
    a.release_date.localeCompare(b.release_date),
  );

  const first = sorted[0]?.release_date;
  const last = sorted[sorted.length - 1]?.release_date;

  if (!first || !last) {
    return null;
  }

  return {
    minimum: first,
    maximum: last,
  };
}

function ReleaseRow({ movie }: { movie: UpcomingMovie }) {
  return (
    <li className="group relative h-[550px] w-full max-w-[340px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition hover:bg-white/[0.05] xl:h-[430px] xl:max-w-[310px] lg:h-[390px] lg:max-w-[280px] h1text8:h-[400px] h1text8:max-w-[250px] xsmd:h-[450px] smd:h-[350px] smd:max-w-[220px] sss:h-[330px] sss:max-w-[200px] s:h-[370px] s:max-w-[210px]">
      <div className="absolute inset-x-0 top-0 z-10 flex h-11 items-center justify-between border-b border-white/10 bg-black/45 px-3 smd:h-10 smd:px-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primaryM-300 smd:text-[9px]">
          {formatMonthLong(movie.release_date)}
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-bold text-black smd:h-8 smd:w-8">
          {formatDay(movie.release_date)}
        </div>
      </div>

      <div className="relative h-full w-full overflow-hidden bg-zinc-800 pt-11 smd:pt-10">
        {movie.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-zinc-700" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 smd:p-2.5 sss:p-2">
          <p className="line-clamp-2 text-base font-semibold leading-tight text-white lg:text-sm smd:text-[13px] sss:text-xs">
            {movie.title}
          </p>
          <p className="mt-1 line-clamp-1 text-xs text-gray-200 smd:text-[11px] sss:text-[10px]">
            {formatRange(movie.release_date)}
          </p>
        </div>
      </div>
    </li>
  );
}

export default function UpcomingPageClient({
  initialPages,
}: {
  initialPages: UpcomingResponse[];
}) {
  const [pages, setPages] = useState<UpcomingResponse[]>(initialPages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState(() => {
    const loadedMax = Math.max(...initialPages.map((page) => page.page));
    return loadedMax + 1;
  });

  const firstPage = pages[0] ?? null;
  const totalPages = firstPage?.total_pages ?? 1;
  const totalResults = firstPage?.total_results ?? 0;
  const hasMore = nextPage <= totalPages;

  const moviesForView = useMemo(() => {
    const today = getLocalDateString();

    const allFetched = pages
      .flatMap((page) => page.results)
      .filter((item) => Boolean(item.release_date))
      .filter((item) => item.release_date >= today);

    const deduped = Array.from(
      new Map(allFetched.map((movie) => [movie.id, movie])).values(),
    );

    return deduped;
  }, [pages]);

  const dateWindow = getDateWindow(moviesForView) ?? firstPage?.dates ?? null;
  const heroItems = useMemo(
    () => moviesForView.filter((movie) => movie.backdrop_path).slice(0, 6),
    [moviesForView],
  );

  async function handleLoadMore() {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const response = await fetch(`/api/upcoming?page=${nextPage}`);

      if (!response.ok) {
        throw new Error("Failed to load more upcoming movies");
      }

      const json = (await response.json()) as UpcomingResponse;

      setPages((prev) => [...prev, json]);
      setNextPage((prev) => prev + 1);
    } catch {
      setLoadMoreError("Could not load more movies. Try again.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05060b] text-white">
      <section className="relative overflow-hidden border-b border-white/10 pb-8 pt-20">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,#111827_0%,#05060b_55%)]" />

        <div className="mx-auto w-[94%]">
          <div className="relative mb-8 overflow-hidden rounded-xl border border-white/15">
            <div className="grid h-[230px] grid-cols-6 gap-[1px] smd:h-[170px] s:h-[140px]">
              {heroItems.map((movie) => (
                <div key={movie.id} className="relative h-full w-full">
                  <Image
                    src={`https://image.tmdb.org/t/p/w780/${movie.backdrop_path}`}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/65 to-[#05060b]" />

            <div className="absolute inset-x-0 bottom-0 p-6 smd:p-4 s:p-3">
              <p className="mb-1 text-xs uppercase tracking-[0.18em] text-primaryM-400">
                Upcoming release
              </p>
              <h1 className="max-w-[680px] text-4xl font-extrabold leading-tight lg:text-3xl h1text8:text-2xl smd:text-xl">
                Schedule release all movie around the world
              </h1>
              <p className="mt-2 text-xs text-gray-300 smd:text-[11px]">
                Loaded {moviesForView.length} upcoming movies from TMDB pages 1 to {nextPage - 1} (total results: {totalResults}).
              </p>
              {dateWindow ? (
                <p className="mt-1 text-xs text-gray-400 smd:text-[11px]">
                  Release range: {formatRange(dateWindow.minimum)} to {formatRange(dateWindow.maximum)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <ul className="m-0 grid list-none grid-cols-4 justify-items-center gap-3 p-0 lg:grid-cols-2 smd:grid-cols-1">
              {moviesForView.map((movie) => (
                <ReleaseRow key={`upcoming-${movie.id}`} movie={movie} />
              ))}
            </ul>

            {moviesForView.length === 0 && (
              <p className="pt-6 text-sm text-gray-300">
                No upcoming movies from today in loaded pages yet.
              </p>
            )}
          </div>

          {(hasMore || loadMoreError) && (
            <div className="mt-8 flex flex-col items-center gap-2">
              {hasMore && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="rounded-md border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingMore ? "Loading..." : "Show more"}
                </button>
              )}

              {loadMoreError && <p className="text-xs text-red-300">{loadMoreError}</p>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
