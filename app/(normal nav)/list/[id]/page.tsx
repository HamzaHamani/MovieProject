import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Metadata } from "next";

import ListLikeButton from "@/components/list/listLikeButton";
import ListAddMovies from "@/components/bookmarks/listAddMovies";
import ListCollaboratorsManager from "@/components/profile/listCollaboratorsManager";
import EditListDetails from "@/components/bookmarks/editListDetails";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getBookmarkById,
  getListLikeStats,
  getListCollaborators,
  getMoviesBook,
  getSpecifiedMovie,
  getSpecifiedTV,
  getUserDbProfileById,
  getUser,
  canUserEditBookmark,
  removeMovieFromBookmark,
  updateBookmarkDetails,
} from "@/lib/actions";
import { decodeStoredMediaId } from "@/lib/utils";
import { DEFAULT_OG_IMAGE, SITE_URL, SITE_NAME } from "@/config/site";
import { generatePageMetadata } from "@/lib/seo-utils";

const systemLikesKeywords = ["likes", "like", "liked", "love", "loved"];
const systemFavoritesKeywords = ["favorite", "favourite", "fav"];
const systemWatchlistKeywords = [
  "watchlist",
  "watch later",
  "to watch",
  "queue",
];

function isSystemListName(name: string) {
  const normalized = name.trim().toLowerCase();
  return (
    systemFavoritesKeywords.some((key) => normalized.includes(key)) ||
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const list = await getBookmarkById(id);
    if (!list) return { title: "List Not Found" };

    const movies = await getMoviesBook(list.id);
    const owner = await getUserDbProfileById(list.userId);

    // Get poster from first movie in list
    let posterUrl = DEFAULT_OG_IMAGE;
    if (movies && movies.length > 0) {
      const firstMovie = movies[0];
      const resolved = await resolveSavedItem(firstMovie.movieId);
      if (resolved?.posterPath) {
        posterUrl = `https://image.tmdb.org/t/p/w1280${resolved.posterPath}`;
      }
    }

    const description =
      list.description ||
      `Check out the "${list.bookmarkName}" list on ${SITE_NAME}. ${movies?.length || 0} movies and shows curated by ${owner?.name || "a cinephile"}.`;

    return generatePageMetadata({
      title: `${list.bookmarkName} - List by ${owner?.name || "User"}`,
      description,
      canonical: `${SITE_URL}/list/${id}`,
      ogImage: posterUrl,
      ogType: "website",
      authors: [owner?.name || "User"],
    });
  } catch (error) {
    return { title: "List" };
  }
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
  const canManageMovies = await canUserEditBookmark(list.id);

  const [movies, likeStats, ownerProfile, collaborators] = await Promise.all([
    getMoviesBook(list.id),
    getListLikeStats(list.id),
    getUserDbProfileById(list.userId),
    getListCollaborators(list.id),
  ]);

  const visibleCollaborators = collaborators.filter((collab) =>
    Boolean(collab.userId),
  );

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
    const isPublic = formData.get("isPublic") === "on";

    await updateBookmarkDetails({
      bookmarkId: list.id,
      bookmarkName,
      description,
      isPublic,
    });

    revalidatePath(`/list/${list.id}`);
  }

  async function removeMovieAction(formData: FormData) {
    "use server";

    if (!canManageMovies)
      throw new Error("Only owner or accepted collaborators can edit movies");

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
              <div
                className={`mt-3 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${list.isPublic ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/[0.04] text-gray-300"}`}
              >
                {list.isPublic ? "Public list" : "Private list"}
              </div>
              <p className="mt-2 text-sm text-gray-300">{list.description}</p>
              <p className="mt-3 text-xs text-gray-400">
                {movies.length} item{movies.length === 1 ? "" : "s"}
              </p>

              {(ownerProfile?.username || visibleCollaborators.length > 0) && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {ownerProfile?.username ? (
                    <Link
                      href={`/profile/${ownerProfile.username}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 transition hover:border-primaryM-500/40 hover:bg-white/[0.06]"
                    >
                      <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarImage
                          src={ownerProfile.image ?? undefined}
                          alt={ownerProfile.username}
                        />
                        <AvatarFallback className="bg-white/[0.08] text-xs text-white">
                          {getInitials(
                            ownerProfile.name ?? ownerProfile.username,
                          )}
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

                  {visibleCollaborators.map((collab) => (
                    <Link
                      key={collab.id}
                      href={
                        collab.userUsername
                          ? `/profile/${collab.userUsername}`
                          : "#"
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 transition hover:border-primaryM-500/40 hover:bg-white/[0.06]"
                    >
                      <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarImage src={collab.userImage ?? undefined} />
                        <AvatarFallback className="bg-white/[0.08] text-xs text-white">
                          {getInitials(
                            collab.userName ?? collab.userUsername ?? "U",
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <div className="leading-tight">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                          Collaborator
                        </p>
                        <p className="text-sm font-medium text-white">
                          @{collab.userUsername ?? "user"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {!isSystemList ? (
              <div className="flex items-center gap-2">
                <div className="order-1 md:order-2">
                  {isOwner ? (
                    <EditListDetails
                      bookmarkId={list.id}
                      initialName={list.bookmarkName}
                      initialDescription={list.description}
                      initialIsPublic={list.isPublic}
                    />
                  ) : null}
                </div>

                <div className="order-2 md:order-1">
                  <ListLikeButton
                    listId={list.id}
                    initialLiked={likeStats.viewerLiked}
                    initialLikesCount={likeStats.likesCount}
                  />
                </div>
              </div>
            ) : (
              <p className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
                System list
              </p>
            )}
          </div>

          {isOwner && !isSystemList ? (
            <div className="mt-5 flex items-center gap-2">
              <Input
                name="bookmarkName"
                defaultValue={list.bookmarkName}
                className="hidden"
              />
              <EditListDetails
                bookmarkId={list.id}
                initialName={list.bookmarkName}
                initialDescription={list.description}
                initialIsPublic={list.isPublic}
              />
            </div>
          ) : !isOwner ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-300">
              You can view and like this list.
              {canManageMovies
                ? " You can also add and remove titles as an accepted collaborator."
                : " Only the owner can edit list details."}
            </div>
          ) : null}

          {!isSystemList ? (
            <div className="mt-5 flex flex-wrap items-start gap-2">
              {canManageMovies ? (
                <ListAddMovies
                  bookmarkId={list.id}
                  listName={list.bookmarkName}
                />
              ) : null}
              <ListCollaboratorsManager
                bookmarkId={list.id}
                isOwner={isOwner}
              />
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

                  {canManageMovies ? (
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
