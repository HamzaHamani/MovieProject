import { Metadata } from "next";
import Link from "next/link";

import ListAddMovies from "@/components/bookmarks/listAddMovies";
import CreateListQuick from "@/components/bookmarks/createListQuick";
import RemoveFromListButton from "@/components/bookmarks/removeFromListButton";
import MovieTvCard from "@/components/general/movieTvCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getBookmarks,
  getMoviesBook,
  getSpecifiedMovie,
  getSpecifiedTV,
  getUser,
} from "@/lib/actions";
import { decodeStoredMediaId } from "@/lib/utils";

const systemLikesKeywords = ["likes", "like", "liked", "love", "loved"];
const systemWatchlistKeywords = [
  "watchlist",
  "watch later",
  "to watch",
  "queue",
];

function isSystemListName(name: string) {
  const normalized = name.trim().toLowerCase();
  return (
    systemLikesKeywords.some((key) => normalized.includes(key)) ||
    systemWatchlistKeywords.some((key) => normalized.includes(key))
  );
}

export const metadata: Metadata = {
  title: "Bookmarks",
};

type TResolvedSavedItem = {
  id: string;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  mediaTypeLabel: "Movie" | "TV";
  year: string;
  href: string;
};

async function resolveSavedItem(
  movieId: string,
): Promise<TResolvedSavedItem | null> {
  const decoded = decodeStoredMediaId(movieId);
  const resolvedId = decoded.id;
  if (!resolvedId) return null;

  if (decoded.mediaType === "tv") {
    try {
      const tv = await getSpecifiedTV(resolvedId);
      return {
        id: resolvedId,
        title: tv.name ?? "Untitled",
        posterPath: tv.poster_path,
        voteAverage: Number(tv.vote_average ?? 0),
        mediaTypeLabel: "TV",
        year: tv.first_air_date?.slice(0, 4) ?? "----",
        href: `/tv/${resolvedId}`,
      };
    } catch {
      return null;
    }
  }

  if (decoded.mediaType === "movie") {
    try {
      const movie = await getSpecifiedMovie(resolvedId);
      return {
        id: resolvedId,
        title: movie.title ?? "Untitled",
        posterPath: movie.poster_path,
        voteAverage: Number(movie.vote_average ?? 0),
        mediaTypeLabel: "Movie",
        year: movie.release_date?.slice(0, 4) ?? "----",
        href: `/movie/${resolvedId}`,
      };
    } catch {
      return null;
    }
  }

  try {
    const movie = await getSpecifiedMovie(resolvedId);
    return {
      id: resolvedId,
      title: movie.title ?? "Untitled",
      posterPath: movie.poster_path,
      voteAverage: Number(movie.vote_average ?? 0),
      mediaTypeLabel: "Movie",
      year: movie.release_date?.slice(0, 4) ?? "----",
      href: `/movie/${resolvedId}`,
    };
  } catch {
    try {
      const tv = await getSpecifiedTV(resolvedId);
      return {
        id: resolvedId,
        title: tv.name ?? "Untitled",
        posterPath: tv.poster_path,
        voteAverage: Number(tv.vote_average ?? 0),
        mediaTypeLabel: "TV",
        year: tv.first_air_date?.slice(0, 4) ?? "----",
        href: `/tv/${resolvedId}`,
      };
    } catch {
      return null;
    }
  }
}

export default async function Saved() {
  const user = await getUser();

  if (!user?.id) {
    return (
      <div className="container mt-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-textMain lg:p-5 sm:p-4">
          <h1 className="text-3xl font-semibold text-white lg:text-2xl sm:text-xl">
            Your Lists
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            Sign in to view and manage your bookmarks.
          </p>
          <Button
            asChild
            className="mt-5 bg-primaryM-500 text-black hover:bg-primaryM-600"
          >
            <Link href="/sign-in">Go to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const lists = await getBookmarks(user.id);
  const listsWithMovies = await Promise.all(
    lists.map(async (list) => {
      const movies = await getMoviesBook(list.id);
      return { list, movies };
    }),
  );

  const customListsWithMovies = listsWithMovies.filter(
    ({ list }) => !isSystemListName(list.bookmarkName),
  );

  const totalSaved = customListsWithMovies.reduce(
    (acc, item) => acc + item.movies.length,
    0,
  );
  const uniqueMovieIds = Array.from(
    new Set(
      customListsWithMovies.flatMap((item) =>
        item.movies.map((movie) => movie.movieId),
      ),
    ),
  );

  const resolvedEntries = await Promise.all(
    uniqueMovieIds.map(async (movieId) => ({
      movieId,
      value: await resolveSavedItem(String(movieId)),
    })),
  );

  const resolvedById = new Map(
    resolvedEntries
      .filter((entry) => Boolean(entry.value))
      .map((entry) => [entry.movieId, entry.value as TResolvedSavedItem]),
  );

  return (
    <div className="container mt-5 space-y-6 pb-10 text-textMain">
      <section className="rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(234,179,8,0.13),transparent_42%),theme(colors.backgroundM)] p-7 lg:p-6 md:p-5 sm:p-4">
        <h1 className="text-6xl font-semibold text-white lg:text-5xl md:text-4xl s:text-3xl">
          Your Lists
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-300 md:text-sm">
          Keep track of the movies and TV shows you save, organized by your own
          custom lists.
        </p>

        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.02] p-2 sm:p-1">
          <div className="relative grid auto-rows-fr grid-cols-3 gap-2 lg:grid-cols-2 sm:grid-cols-1">
            <div className="flex min-h-[170px] w-full flex-col justify-between rounded-2xl border border-white/15 bg-[radial-gradient(circle_at_18%_18%,rgba(234,179,8,0.22),transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.3)] lg:min-h-[150px] lg:p-6 sm:min-h-[130px] sm:p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-300">
                Total Lists
              </p>
              <p className="mt-4 text-5xl font-semibold leading-none text-white lg:text-4xl sm:text-[34px]">
                {customListsWithMovies.length}
              </p>
            </div>
            <div className="flex min-h-[170px] w-full flex-col justify-between rounded-2xl border border-white/15 bg-[radial-gradient(circle_at_50%_14%,rgba(234,179,8,0.2),transparent_50%),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.3)] lg:min-h-[150px] lg:p-6 sm:min-h-[130px] sm:p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-300">
                Saved Items
              </p>
              <p className="mt-4 text-5xl font-semibold leading-none text-white lg:text-4xl sm:text-[34px]">
                {totalSaved}
              </p>
            </div>
            <div className="flex min-h-[170px] w-full flex-col justify-between rounded-2xl border border-white/15 bg-[radial-gradient(circle_at_82%_18%,rgba(234,179,8,0.22),transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.3)] lg:min-h-[150px] lg:p-6 sm:min-h-[130px] sm:p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-300">
                Unique Titles
              </p>
              <p className="mt-4 text-5xl font-semibold leading-none text-white lg:text-4xl sm:text-[34px]">
                {uniqueMovieIds.length}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <CreateListQuick />
          <Button
            asChild
            className="bg-primaryM-500 text-black hover:bg-primaryM-600"
          >
            <Link href="/explore">Discover More</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            <Link href="/search">Search Titles</Link>
          </Button>
        </div>
      </section>

      <Separator className="bg-white/10" />

      {customListsWithMovies.length === 0 && (
        <section className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center lg:p-6 sm:p-5">
          <h2 className="text-2xl font-semibold text-white lg:text-xl">
            No lists yet
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-gray-300">
            Start from any movie or TV detail page and use the Add List button
            to create your first list.
          </p>
          <Button
            asChild
            className="mt-5 bg-primaryM-500 text-black hover:bg-primaryM-600"
          >
            <Link href="/explore">Explore Movies and TV</Link>
          </Button>
        </section>
      )}

      {customListsWithMovies.map(({ list, movies }) => (
        <section
          key={list.id}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-4 sm:p-3"
        >
          <div className="flex items-end justify-between gap-2 sm:flex-col sm:items-start">
            <div className="min-w-0">
              <Link
                href={`/list/${list.id}`}
                className="inline-block truncate text-2xl font-semibold text-white transition hover:text-primaryM-500 lg:text-xl sm:text-lg"
              >
                {list.bookmarkName}
              </Link>
              <p className="break-words text-sm text-gray-300">
                {list.description}
              </p>
              <div className="mt-3">
                <ListAddMovies
                  bookmarkId={list.id}
                  listName={list.bookmarkName}
                />
              </div>
            </div>
            <p className="text-sm text-gray-400">
              {movies.length} item{movies.length === 1 ? "" : "s"}
            </p>
          </div>

          {movies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-sm text-gray-300">
              This list is empty. Add titles from any movie or TV details page.
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3 xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 s:grid-cols-1">
              {movies.map((savedMovie) => {
                const item = resolvedById.get(savedMovie.movieId);

                if (!item) {
                  return (
                    <div
                      key={savedMovie.id}
                      className="flex h-[240px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center text-xs text-gray-300"
                    >
                      Title unavailable
                    </div>
                  );
                }

                return (
                  <div key={savedMovie.id} className="relative">
                    <MovieTvCard
                      href={item.href}
                      posterPath={item.posterPath}
                      title={item.title}
                      voteAverage={item.voteAverage}
                      mediaTypeLabel={item.mediaTypeLabel}
                      year={item.year}
                      className="w-full"
                      imageClassName="h-[320px] xl:h-[300px] lg:h-[280px] sm:h-[260px] s:h-[240px]"
                    />
                    <RemoveFromListButton
                      bookmarkId={list.id}
                      listName={list.bookmarkName}
                      movieId={savedMovie.movieId}
                      title={item.title}
                      posterPath={item.posterPath}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
