import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

import ListLikeButton from "@/components/list/listLikeButton";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getBookmarkById,
  getListLikeStats,
  getMoviesBook,
  getSpecifiedMovie,
  getSpecifiedTV,
  getUserDbProfileById,
  getUser,
  removeMovieFromBookmark,
  updateBookmarkDetails,
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

type ResolvedListMovie = {
  movieId: string;
  title: string;
  posterPath: string | null;
  mediaTypeLabel: "Movie" | "TV";
  year: string;
  href: string;
};

async function resolveSavedItem(
  movieId: string,
): Promise<ResolvedListMovie | null> {
  const decoded = decodeStoredMediaId(movieId);
  const resolvedId = decoded.id;
  if (!resolvedId) return null;

  if (decoded.mediaType === "tv") {
    try {
      const tv = await getSpecifiedTV(resolvedId);
      return {
        movieId,
        title: tv.name ?? "Untitled",
        posterPath: tv.poster_path,
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
        movieId,
        title: movie.title ?? "Untitled",
        posterPath: movie.poster_path,
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
      movieId,
      title: movie.title ?? "Untitled",
      posterPath: movie.poster_path,
      mediaTypeLabel: "Movie",
      year: movie.release_date?.slice(0, 4) ?? "----",
      href: `/movie/${resolvedId}`,
    };
  } catch {
    try {
      const tv = await getSpecifiedTV(resolvedId);
      return {
        movieId,
        title: tv.name ?? "Untitled",
        posterPath: tv.poster_path,
        mediaTypeLabel: "TV",
        year: tv.first_air_date?.slice(0, 4) ?? "----",
        href: `/tv/${resolvedId}`,
      };
    } catch {
      return null;
    }
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewer = await getUser();

  const list = await getBookmarkById(id);
  if (!list) notFound();

  const isOwner = viewer?.id === list.userId;
  const isSystemList = isSystemListName(list.bookmarkName);

  const [movies, likeStats, ownerProfile] = await Promise.all([
    getMoviesBook(list.id),
    getListLikeStats(list.id),
    getUserDbProfileById(list.userId),
  ]);

  const resolvedItems = await Promise.all(
    movies.map(async (item) => ({
      rowId: item.id,
      value: await resolveSavedItem(String(item.movieId)),
    })),
  );

  async function updateListAction(formData: FormData) {
    "use server";

    if (!isOwner) throw new Error("Only the owner can edit this list");

    const bookmarkName = String(formData.get("bookmarkName") ?? "");
    const description = String(formData.get("description") ?? "");

    await updateBookmarkDetails({
      bookmarkId: list.id,
      bookmarkName,
      description,
    });

    revalidatePath(`/list/${list.id}`);
  }

  async function removeMovieAction(formData: FormData) {
    "use server";

    if (!isOwner) throw new Error("Only the owner can edit this list");

    const movieId = String(formData.get("movieId") ?? "");
    if (!movieId) return;

    await removeMovieFromBookmark({
      bookmarkId: list.id,
      movieId,
    });

    revalidatePath(`/list/${list.id}`);
    revalidatePath(`/profile`);
  }

  return (
    <div className="container mt-6 pb-12 text-textMain">
      <div className="space-y-6">
        <div>
          <Link
            href="/bookmarks"
            className="text-sm text-primaryM-500 hover:text-primaryM-400"
          >
            Back to all lists
          </Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-4">
          <div className="flex items-start justify-between gap-3 sm:flex-col sm:items-start">
            <div>
              <h1 className="text-3xl font-semibold text-white sm:text-2xl">
                {list.bookmarkName}
              </h1>
              <p className="mt-2 text-sm text-gray-300">{list.description}</p>
              <p className="mt-3 text-xs text-gray-400">
                {movies.length} item{movies.length === 1 ? "" : "s"}
              </p>

              {ownerProfile?.username ? (
                <Link
                  href={`/profile/${ownerProfile.username}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 transition hover:border-primaryM-500/40 hover:bg-white/[0.06]"
                >
                  <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarImage
                      src={ownerProfile.image ?? undefined}
                      alt={ownerProfile.username}
                    />
                    <AvatarFallback className="bg-white/[0.08] text-xs text-white">
                      {getInitials(ownerProfile.name ?? ownerProfile.username)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="leading-tight">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      List owner
                    </p>
                    <p className="text-sm font-medium text-white">
                      @{ownerProfile.username}
                    </p>
                  </div>
                </Link>
              ) : null}
            </div>
            {!isSystemList ? (
              <ListLikeButton
                listId={list.id}
                initialLiked={likeStats.viewerLiked}
                initialLikesCount={likeStats.likesCount}
              />
            ) : (
              <p className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
                System list
              </p>
            )}
          </div>

          {isOwner && !isSystemList ? (
            <form
              action={updateListAction}
              className="mt-5 grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                Edit List
              </p>
              <Input
                name="bookmarkName"
                defaultValue={list.bookmarkName}
                className="border-white/15 bg-white/5 text-white"
                required
              />
              <Input
                name="description"
                defaultValue={list.description}
                className="border-white/15 bg-white/5 text-white"
                required
              />
              <Button
                type="submit"
                className="w-fit bg-primaryM-500 text-black hover:bg-primaryM-600"
              >
                Save changes
              </Button>
            </form>
          ) : !isOwner ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-300">
              You can view and like this list, but only the owner can edit it.
            </div>
          ) : null}
        </section>

        {resolvedItems.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-sm text-gray-300">
            This list has no movies yet.
          </section>
        ) : (
          <section className="grid grid-cols-6 gap-3 xl:grid-cols-5 lg:grid-cols-4 sm:grid-cols-3 s:grid-cols-2">
            {resolvedItems.map(({ rowId, value }) => {
              if (!value) {
                return (
                  <div
                    key={rowId}
                    className="flex aspect-[2/3] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center text-xs text-gray-300"
                  >
                    Title unavailable
                  </div>
                );
              }

              return (
                <div
                  key={rowId}
                  className="group relative overflow-hidden rounded-2xl"
                >
                  <Link href={value.href} className="block">
                    <div className="relative aspect-[2/3]">
                      <LazyBlurImage
                        src={`https://image.tmdb.org/t/p/w500/${value.posterPath}`}
                        alt={`${value.title} poster`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        placeholderClassName="bg-zinc-700/50"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <h3 className="line-clamp-2 text-sm font-semibold text-white">
                          {value.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-300">
                          <span>{value.year}</span>
                          <span>•</span>
                          <span>{value.mediaTypeLabel}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {isOwner ? (
                    <form action={removeMovieAction}>
                      <input
                        type="hidden"
                        name="movieId"
                        value={value.movieId}
                      />
                      <button
                        type="submit"
                        className="absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-red-400/50 bg-red-500/90 text-white shadow transition hover:bg-red-500"
                        aria-label={`Remove ${value.title}`}
                      >
                        x
                      </button>
                    </form>
                  ) : null}
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
