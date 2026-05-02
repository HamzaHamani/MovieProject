import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import {
  Bookmark,
  Clock3,
  Heart,
  List,
  MessageSquareQuote,
  Repeat2,
  Star,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import { Metadata } from "next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowToggleButton from "@/components/profile/followToggleButton";
import EditProfileDialog from "@/components/profile/editProfileDialog";
import ProfileBackdropPicker from "@/components/profile/profileBackdropPicker";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import { Button } from "@/components/ui/button";
import RemoveFromSectionButton from "@/components/profile/removeFromSectionButton";
import ReviewLikeButton from "@/components/profile/reviewLikeButton";
import ShelfAddMovies from "@/components/profile/shelfAddMovies";
import UserStatisticsSection from "../../../../components/profile/userStatisticsSection";
import { ReplyForm } from "@/components/profile/replyForm";
import { Separator } from "@/components/ui/separator";
import MentionText from "@/components/general/mentionText";
import {
  addReviewReply,
  getBookmarks,
  getCollaborativeBookmarksForCurrentUser,
  getLoggedMoviesForUser,
  getMoviesBook,
  getReviewEngagement,
  getSpecifiedMovie,
  getSpecifiedTV,
  getUser,
  getUserDbProfileByUsername,
  getUserSocialStats,
} from "@/lib/actions";
import { decodeStoredMediaId } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profile",
};

export const dynamic = "force-dynamic";

type BookmarkRow = Awaited<ReturnType<typeof getBookmarks>>[number];
type BookmarkMovieRow = Awaited<ReturnType<typeof getMoviesBook>>[number];
type LoggedMovieRow = Awaited<
  ReturnType<typeof getLoggedMoviesForUser>
>[number];

type ShelfItem = {
  movieId: string;
  addedAt: Date | null;
  sourceListName: string;
};

type ResolvedMedia = {
  id: string;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  mediaTypeLabel: "Movie" | "TV Show";
  year: string;
  href: string;
};

const favoriteKeywords = ["favorite", "favourite", "fav"];
const likedKeywords = ["liked", "like", "love", "loved"];
const watchlistKeywords = ["watchlist", "watch later", "to watch", "queue"];
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

function toTimestamp(value: Date | string | null | undefined) {
  if (!value) return 0;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function matchesKeywords(value: string, keywords: string[]) {
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function collectShelfItems(
  listsWithMovies: Array<{ list: BookmarkRow; movies: BookmarkMovieRow[] }>,
  matcher: (list: BookmarkRow) => boolean,
) {
  const byMovieId = new Map<string, ShelfItem>();

  listsWithMovies.forEach(({ list, movies }) => {
    if (!matcher(list)) return;

    movies.forEach((movie) => {
      const current = byMovieId.get(movie.movieId);
      const nextItem: ShelfItem = {
        movieId: movie.movieId,
        addedAt: movie.addedAt ?? list.createdAt ?? null,
        sourceListName: list.bookmarkName,
      };

      if (
        !current ||
        toTimestamp(nextItem.addedAt) > toTimestamp(current.addedAt)
      ) {
        byMovieId.set(movie.movieId, nextItem);
      }
    });
  });

  return [...byMovieId.values()].sort(
    (left, right) => toTimestamp(right.addedAt) - toTimestamp(left.addedAt),
  );
}

async function resolveMediaById(id: string): Promise<ResolvedMedia | null> {
  const decoded = decodeStoredMediaId(id);
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
        mediaTypeLabel: "TV Show",
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
        mediaTypeLabel: "Film",
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
      mediaTypeLabel: "Film",
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
        mediaTypeLabel: "TV Show",
        year: tv.first_air_date?.slice(0, 4) ?? "----",
        href: `/tv/${resolvedId}`,
      };
    } catch {
      return null;
    }
  }
}

function ProfilePosterGrid({
  title,
  description,
  icon: Icon,
  sectionType,
  items,
  mediaMap,
  maxItems,
  emptyTitle,
  emptyDescription,
  canEdit,
  seeMoreLink,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  sectionType: "favorites" | "likes" | "watchlist";
  items: ShelfItem[];
  mediaMap: Map<string, ResolvedMedia | null>;
  maxItems: number;
  emptyTitle: string;
  emptyDescription: string;
  canEdit: boolean;
  seeMoreLink?: string;
}) {
  const visibleItems = items.slice(0, maxItems);

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] md:p-5 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gray-400">
            <Icon className="h-4 w-4 text-primaryM-500" />
            <span>{title}</span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-gray-300">{description}</p>
          {canEdit ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ShelfAddMovies section={sectionType} />
            </div>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
            {items.length} title{items.length === 1 ? "" : "s"}
          </div>
          {seeMoreLink && items.length > maxItems && (
            <Link
              href={seeMoreLink}
              className="text-xs font-medium text-primaryM-500 underline underline-offset-2 transition hover:text-primaryM-400"
            >
              See all
            </Link>
          )}
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-5 text-sm text-gray-300">
          <p className="font-medium text-white">{emptyTitle}</p>
          <p className="mt-1 text-gray-400">{emptyDescription}</p>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-3 xl:grid-cols-5 lg:grid-cols-4 sm:grid-cols-3 s:grid-cols-2">
          {visibleItems.map((item) => {
            const media = mediaMap.get(item.movieId) ?? null;

            if (!media) {
              return (
                <div
                  key={`${title}-${item.movieId}`}
                  className="flex aspect-[2/3] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center text-xs text-gray-300"
                >
                  Title unavailable
                </div>
              );
            }

            return (
              <div
                key={`${title}-${item.movieId}`}
                className="group relative overflow-hidden rounded-2xl transition-transform duration-200 hover:-translate-y-1"
              >
                <Link href={media.href} className="block">
                  <div className="relative aspect-[2/3]">
                    <LazyBlurImage
                      src={`https://image.tmdb.org/t/p/w500/${media.posterPath}`}
                      alt={`${media.title} poster`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      placeholderClassName="bg-zinc-700/50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <h3 className="line-clamp-2 text-sm font-semibold text-white">
                        {media.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-300">
                        <span>{media.year}</span>
                        <span>•</span>
                        <span>{media.mediaTypeLabel}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-gray-300">
                        <span className="truncate">{item.sourceListName}</span>
                        <span className="flex items-center gap-1 text-primaryM-500">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {media.voteAverage.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                {canEdit ? (
                  <RemoveFromSectionButton
                    section={sectionType}
                    movieId={item.movieId}
                    title={media.title}
                    posterPath={media.posterPath}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ActivityRow({
  item,
  media,
  profileUsername,
}: {
  item: LoggedMovieRow;
  media: ResolvedMedia | null;
  profileUsername: string;
}) {
  return (
    <Link
      href={`/profile/${profileUsername}/review/${item.id}`}
      className="block h-full min-h-[156px] w-full rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-primaryM-500/40 hover:bg-white/[0.05]"
    >
      <div className="flex h-full gap-4 sm:gap-3">
        <div className="relative -z-10 block w-[150px] shrink-0 overflow-hidden rounded-xl md:w-[200px] sm:w-[150px]">
          {media?.posterPath ? (
            <LazyBlurImage
              src={`https://image.tmdb.org/t/p/w342/${media.posterPath}`}
              alt={`${media.title} poster`}
              className="h-full w-full object-cover"
              placeholderClassName="bg-zinc-700/50"
            />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center bg-white/[0.05] text-xs text-gray-400">
              No poster
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
            Recent activity
          </p>
          <h3 className="mt-1 line-clamp-1 text-lg font-semibold text-white sm:text-base">
            {media?.title ?? "Title unavailable"}
          </h3>
          <p className="mt-2 flex items-center gap-2 text-sm text-gray-300">
            <span>
              {item.watchType === "rewatch" ? "Rewatch" : "First watch"} •{" "}
              {item.rating?.toFixed(1) ?? "0.0"}
            </span>
            <Star className="h-4 w-4 fill-primaryM-500 text-primaryM-500" />
          </p>
          {media ? (
            <p className="mt-1 text-xs text-gray-400">
              {media.year} • {media.mediaTypeLabel}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function ReviewRow({
  item,
  media,
  likesCount,
  replies,
  profileUsername,
}: {
  item: LoggedMovieRow;
  media: ResolvedMedia | null;
  likesCount: number;
  replies: Array<{
    id: string;
    content: string;
    username: string | null;
  }>;
  profileUsername: string;
}) {
  const review = item.review.trim();

  return (
    <Link
      href={`/profile/${profileUsername}/review/${item.id}`}
      className="block h-full min-h-[260px] w-full rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-primaryM-500/40 hover:bg-white/[0.05]"
    >
      <div className="flex h-full gap-4 sm:gap-3">
        <div className="relative -z-10 block w-[150px] shrink-0 overflow-hidden rounded-xl md:w-[200px] sm:w-[150px]">
          {media?.posterPath ? (
            <LazyBlurImage
              src={`https://image.tmdb.org/t/p/w342/${media.posterPath}`}
              alt={`${media.title} poster`}
              className="h-full w-full object-cover"
              placeholderClassName="bg-zinc-700/50"
            />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center bg-white/[0.05] text-xs text-gray-400">
              No poster
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gray-500">
              <MessageSquareQuote className="h-3.5 w-3.5 text-primaryM-500" />
              <span>Recent review</span>
            </div>
            <h3 className="mt-1 line-clamp-1 text-lg font-semibold text-white sm:text-base">
              {media?.title ?? "Title unavailable"}
            </h3>
            <p className="mt-2 flex items-center gap-2 text-sm text-gray-300">
              <span>
                {item.watchType === "rewatch" ? "Rewatch" : "First watch"} •{" "}
                {item.rating?.toFixed(1) ?? "0.0"}
              </span>
              <Star className="h-4 w-4 fill-primaryM-500 text-primaryM-500" />
            </p>
          </div>

          <p className="mt-3 line-clamp-4 text-sm leading-6 text-gray-200">
            <MentionText text={review} disableLinks />
          </p>

          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span>
              {likesCount} like{likesCount === 1 ? "" : "s"}
            </span>
            <span>
              {replies.length} repl{replies.length === 1 ? "y" : "ies"}
            </span>
          </div>

          {replies.length > 0 ? (
            <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="space-y-2">
                {replies.slice(0, 2).map((reply) => (
                  <div key={reply.id} className="text-xs text-gray-300">
                    <span className="font-semibold text-white">
                      @{reply.username ?? "user"}
                    </span>{" "}
                    <MentionText text={reply.content} disableLinks />
                  </div>
                ))}
              </div>
              {replies.length > 2 ? (
                <p className="mt-3 text-xs font-semibold text-primaryM-500">
                  See more replies
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: usernameParam } = await params;
  const viewer = await getUser();

  const profileUser = await getUserDbProfileByUsername(usernameParam);
  if (!profileUser) notFound();

  const isOwner = viewer?.id === profileUser.id;

  const [ownedBookmarks, collaborativeBookmarks, loggedMovies, socialStats] =
    await Promise.all([
      getBookmarks(profileUser.id).catch(() => []),
      isOwner ? getCollaborativeBookmarksForCurrentUser() : Promise.resolve([]),
      getLoggedMoviesForUser(profileUser.id).catch(() => []),
      getUserSocialStats(profileUser.id).catch(() => ({
        followersCount: 0,
        followingCount: 0,
        friendsCount: 0,
        isFollowing: false,
        followsViewer: false,
        isFriend: false,
      })),
    ]);

  const normalizedCollaborativeBookmarks: BookmarkRow[] =
    collaborativeBookmarks.map((list) => ({
      ...list,
      description: list.description ?? "",
      image: list.image ?? "",
      createdAt: list.createdAt ?? new Date(0),
      updatedAt: list.updatedAt ?? list.createdAt ?? new Date(0),
    }));

  const bookmarks: BookmarkRow[] = [...ownedBookmarks];
  const existingIds = new Set(ownedBookmarks.map((list) => list.id));
  normalizedCollaborativeBookmarks.forEach((list) => {
    if (!existingIds.has(list.id)) {
      bookmarks.push(list);
    }
  });

  const listRole = new Map<string, "owner" | "collaborator">();
  ownedBookmarks.forEach((list) => listRole.set(list.id, "owner"));
  normalizedCollaborativeBookmarks.forEach((list) => {
    if (!listRole.has(list.id)) {
      listRole.set(list.id, "collaborator");
    }
  });

  const orderedBookmarks = [...bookmarks].sort(
    (left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt),
  );

  const bookmarksWithMovies = await Promise.all(
    orderedBookmarks.map(async (list) => ({
      list,
      movies: await getMoviesBook(list.id).catch(() => []),
    })),
  );

  const customBookmarksWithMovies = bookmarksWithMovies
    .filter(({ list }) => !isSystemListName(list.bookmarkName))
    .map(({ list, movies }) => ({
      list,
      movies,
      role: listRole.get(list.id) ?? "owner",
    }));

  const favoriteMovies = collectShelfItems(bookmarksWithMovies, (list) =>
    matchesKeywords(list.bookmarkName, favoriteKeywords),
  );
  const likedMovies = collectShelfItems(bookmarksWithMovies, (list) =>
    matchesKeywords(list.bookmarkName, likedKeywords),
  );
  const watchlistMovies = collectShelfItems(bookmarksWithMovies, (list) =>
    matchesKeywords(list.bookmarkName, watchlistKeywords),
  );
  const allSavedMovies = collectShelfItems(bookmarksWithMovies, () => true);
  const likedShelf = likedMovies;

  const recentActivity = loggedMovies.slice(0, 6);
  const recentReviews = loggedMovies
    .filter((item) => item.review.trim().length > 0 || item.rating !== null)
    .slice(0, 6);

  const idsToResolve = Array.from(
    new Set([
      ...favoriteMovies.map((item) => item.movieId),
      ...likedShelf.map((item) => item.movieId),
      ...watchlistMovies.map((item) => item.movieId),
      ...recentActivity.map((item) => item.showId),
      ...recentReviews.map((item) => item.showId),
      ...loggedMovies.map((item) => item.showId),
    ]),
  );

  const resolvedPairs = await Promise.all(
    idsToResolve.map(async (id) => [id, await resolveMediaById(id)] as const),
  );
  const mediaMap = new Map<string, ResolvedMedia | null>(resolvedPairs);

  // Separate logged movies and TV shows
  const loggedMoviesWatched = loggedMovies
    .filter((item) => {
      const media = mediaMap.get(item.showId);
      return media?.mediaTypeLabel === "Film";
    })
    .map((item) => ({
      movieId: item.showId,
      addedAt: item.watchedAt,
      sourceListName: "Watched",
    }));

  const loggedTvShowsWatched = loggedMovies
    .filter((item) => {
      const media = mediaMap.get(item.showId);
      return media?.mediaTypeLabel === "TV Show";
    })
    .map((item) => ({
      movieId: item.showId,
      addedAt: item.watchedAt,
      sourceListName: "Watched",
    }));

  // Sort by date descending
  loggedMoviesWatched.sort(
    (a, b) => toTimestamp(b.addedAt) - toTimestamp(a.addedAt),
  );
  loggedTvShowsWatched.sort(
    (a, b) => toTimestamp(b.addedAt) - toTimestamp(a.addedAt),
  );

  const totalSavedMovies = allSavedMovies.length;
  const reviewedCount = recentReviews.length;
  const moviesWatchedCount = loggedMoviesWatched.length;
  const tvShowsWatchedCount = loggedTvShowsWatched.length;

  const displayName =
    profileUser.name?.trim() || profileUser.email || "Profile";
  const profileBio =
    profileUser.bio?.trim() ||
    "Tracking films, writing reviews, and building lists.";
  const profileBackdropUrl = profileUser.backdropPath
    ? `https://image.tmdb.org/t/p/original${profileUser.backdropPath}`
    : null;
  const initials = getInitials(displayName);
  const isPremium = profileUser.premium === true;
  const username = profileUser.username ?? null;
  const profileStats = [
    {
      label: "Followers",
      value: socialStats.followersCount,
      href: `/profile/${usernameParam}/connections?view=followers`,
    },
    {
      label: "Following",
      value: socialStats.followingCount,
      href: `/profile/${usernameParam}/connections?view=following`,
    },
    {
      label: "Friends",
      value: socialStats.friendsCount,
      href: `/profile/${usernameParam}/connections?view=friends`,
    },
  ];

  const reviewEngagement = await Promise.all(
    recentReviews.map(async (review) => ({
      reviewId: review.id,
      engagement: await getReviewEngagement(review.id).catch(() => ({
        likesCount: 0,
        viewerLiked: false,
        replies: [],
      })),
    })),
  );

  const engagementMap = new Map(
    reviewEngagement.map((item) => [item.reviewId, item.engagement] as const),
  );

  async function replyReviewAction(formData: FormData) {
    "use server";

    if (!viewer?.id) throw new Error("You must be signed in to reply");

    const reviewId = String(formData.get("reviewId") ?? "");
    const content = String(formData.get("replyContent") ?? "");
    if (!reviewId || !content.trim()) return;

    const response = await addReviewReply(reviewId, content);
    if (!response.ok) {
      throw new Error(response.error ?? "Failed to add reply");
    }
    revalidatePath(`/profile/${usernameParam}`);
  }

  return (
    <div className="relative min-h-screen text-textMain">
      {profileBackdropUrl ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] overflow-hidden xmd:h-[400px] sm:h-[370px]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.8]"
            style={{
              backgroundImage: `url(${profileBackdropUrl})`,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(13,12,15,0.02),rgba(13,12,15,0.35)_45%,#0d0c0f_88%)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0d0c0f] via-[#0d0c0f]/70 to-transparent" />
        </div>
      ) : null}

      <div className="container relative z-10 pb-12 pt-96 lg:pt-64 sm:pt-48">
        <div className="space-y-8">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(13,12,15,0.88)] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:p-5 sm:p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_560px] items-start gap-6 xl:grid-cols-[minmax(0,1fr)_500px] xmd:grid-cols-1">
              <div className="flex items-start gap-5 sm:flex-col sm:items-center">
                <Avatar className="h-28 w-28 border-2 border-white/20 bg-black/20 ring-4 ring-white/5 sm:h-20 sm:w-20">
                  {profileUser.image ? (
                    <AvatarImage src={profileUser.image} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="bg-white/10 text-lg font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gray-400">
                      <UserRound className="h-4 w-4 text-primaryM-500" />
                      <span>Film Profile</span>
                    </div>
                    {isOwner && (
                      <ProfileBackdropPicker
                        currentBackdropPath={profileUser.backdropPath ?? ""}
                        username={profileUser.username ?? ""}
                        bio={profileUser.bio ?? null}
                        image={profileUser.image ?? null}
                      />
                    )}
                  </div>
                  <h1 className="mt-2 text-5xl font-semibold text-white lg:text-4xl sm:text-3xl">
                    {displayName}
                  </h1>
                  <p className="mt-2 text-sm text-gray-300">
                    {username
                      ? `@${username}`
                      : profileUser.email ?? "No email linked"}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    <MentionText text={profileBio} />
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {isOwner && username ? (
                      <EditProfileDialog
                        currentUsername={username}
                        currentBio={profileUser.bio ?? ""}
                        currentImage={profileUser.image ?? ""}
                        currentBackdropPath={profileUser.backdropPath ?? ""}
                      />
                    ) : null}
                    <Button
                      asChild
                      className="border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
                    >
                      <Link href="/explore">Explore Films</Link>
                    </Button>
                    {!isOwner && viewer?.id && username ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <FollowToggleButton
                          username={username}
                          initialFollowing={socialStats.isFollowing}
                        />

                        {socialStats.followsViewer ? (
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-gray-300">
                            Follows you
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-300">
                    <Link
                      href={`/profile/${username ?? usernameParam}/watched?filter=movie`}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 transition hover:border-primaryM-500/40 hover:bg-white/10"
                    >
                      {loggedMovies.length} film
                      {loggedMovies.length === 1 ? "" : "s"}
                    </Link>
                    <Link
                      href={`/profile/${username ?? usernameParam}/watched?filter=tv`}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 transition hover:border-primaryM-500/40 hover:bg-white/10"
                    >
                      {tvShowsWatchedCount} show
                      {tvShowsWatchedCount === 1 ? "" : "s"}
                    </Link>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                      {favoriteMovies.length} favorite
                      {favoriteMovies.length === 1 ? "" : "s"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                      {likedShelf.length} like
                      {likedShelf.length === 1 ? "" : "s"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                      {watchlistMovies.length} watchlist
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                      {recentActivity.length} activit
                      {recentActivity.length === 1 ? "y" : "ies"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                      {totalSavedMovies} saved
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                      {reviewedCount} review{reviewedCount === 1 ? "" : "s"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                      {customBookmarksWithMovies.length} list
                      {customBookmarksWithMovies.length === 1 ? "" : "s"}
                    </span>
                    {isPremium ? (
                      <span className="rounded-full border border-primaryM-500/40 bg-primaryM-500/10 px-3 py-1 text-primaryM-400">
                        Premium
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-2 py-2">
                <div className="hide-scrollbar flex flex-nowrap items-stretch overflow-x-auto">
                  {profileStats.map((stat, index) => (
                    <Link
                      key={stat.label}
                      href={stat.href}
                      className={`min-w-[86px] px-2 py-2 transition hover:bg-white/[0.06] ${
                        index !== 0 ? "border-l border-white/10" : ""
                      }`}
                    >
                      <p className="text-2xl font-semibold leading-none text-white sm:text-xl">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-gray-400">
                        {stat.label}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <UserStatisticsSection username={username ?? usernameParam} />

          <Separator className="bg-white/10" />

          <div className="space-y-8">
            <ProfilePosterGrid
              title="Favorite Movies"
              description="Your pinned films, surfaced from your favorites list."
              icon={Heart}
              sectionType="favorites"
              items={favoriteMovies}
              mediaMap={mediaMap}
              maxItems={6}
              emptyTitle="No favorites yet"
              emptyDescription={
                isOwner
                  ? "Create or rename a list to Favorites and your pinned titles will appear here."
                  : "This user has no favorite films yet."
              }
              canEdit={isOwner}
            />

            <ProfilePosterGrid
              title="Films I Like"
              description="The titles you have saved across your lists, shown as a bigger shelf."
              icon={ThumbsUp}
              sectionType="likes"
              items={likedShelf}
              mediaMap={mediaMap}
              maxItems={12}
              emptyTitle="No liked movies yet"
              emptyDescription={
                isOwner
                  ? "Add titles to any list and they will show up here."
                  : "This user has no liked films yet."
              }
              canEdit={isOwner}
            />

            <ProfilePosterGrid
              title="Watchlist"
              description="Films and shows you still want to get to."
              icon={Bookmark}
              sectionType="watchlist"
              items={watchlistMovies}
              mediaMap={mediaMap}
              maxItems={8}
              emptyTitle="No watchlist yet"
              emptyDescription={
                isOwner
                  ? "Use the Watchlist button on any title to start filling this shelf."
                  : "This user has no watchlist yet."
              }
              canEdit={isOwner}
            />

            <ProfilePosterGrid
              title="Films Watched"
              description="Films you have logged and watched."
              icon={Clock3}
              sectionType="likes"
              items={loggedMoviesWatched}
              mediaMap={mediaMap}
              maxItems={12}
              emptyTitle="No films watched yet"
              emptyDescription={
                isOwner
                  ? "Log a film to add it to your watched list."
                  : "This user has no films watched yet."
              }
              canEdit={false}
              seeMoreLink={`/profile/${username ?? usernameParam}/watched?filter=movie`}
            />

            <ProfilePosterGrid
              title="TV Shows Watched"
              description="TV shows you have logged and watched."
              icon={Clock3}
              sectionType="likes"
              items={loggedTvShowsWatched}
              mediaMap={mediaMap}
              maxItems={12}
              emptyTitle="No TV shows watched yet"
              emptyDescription={
                isOwner
                  ? "Log a TV show to add it to your watched list."
                  : "This user has no TV shows watched yet."
              }
              canEdit={false}
              seeMoreLink={`/profile/${username ?? usernameParam}/watched?filter=tv`}
            />

            <section
              id="reviews"
              className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] md:p-5 sm:p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gray-400">
                    <Clock3 className="h-4 w-4 text-primaryM-500" />
                    <span>Recent Activity</span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-gray-300">
                    What you watched most recently, with star ratings and watch
                    type.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
                  {recentActivity.length} item
                  {recentActivity.length === 1 ? "" : "s"}
                </div>
              </div>

              {recentActivity.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-5 text-sm text-gray-300">
                  {isOwner
                    ? "Log a film or TV show to start building your activity feed."
                    : "This user has no recent activity yet."}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                  {recentActivity.map((item) => (
                    <ActivityRow
                      key={item.id}
                      item={item}
                      media={mediaMap.get(item.showId) ?? null}
                      profileUsername={username ?? usernameParam}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] md:p-5 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gray-400">
                    <MessageSquareQuote className="h-4 w-4 text-primaryM-500" />
                    <span>Recent Reviews</span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-gray-300">
                    Your latest rated or written reviews appear here.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
                  {recentReviews.length} item
                  {recentReviews.length === 1 ? "" : "s"}
                </div>
              </div>

              {recentReviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-5 text-sm text-gray-300">
                  {isOwner
                    ? "Rate or review a title to see it surface here."
                    : "This user has no reviews yet."}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                  {recentReviews.map((item) => (
                    <div
                      key={item.id}
                      className="flex h-full w-full flex-col gap-3"
                    >
                      <ReviewRow
                        item={item}
                        media={mediaMap.get(item.showId) ?? null}
                        likesCount={engagementMap.get(item.id)?.likesCount ?? 0}
                        replies={(
                          engagementMap.get(item.id)?.replies ?? []
                        ).map((reply) => ({
                          id: reply.id,
                          content: reply.content,
                          username: reply.username,
                        }))}
                        profileUsername={username ?? usernameParam}
                      />

                      {viewer?.id ? (
                        <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                          <ReviewLikeButton
                            reviewId={item.id}
                            initialLiked={
                              engagementMap.get(item.id)?.viewerLiked ?? false
                            }
                            mediaTitle={
                              mediaMap.get(item.showId)?.title ?? "Title"
                            }
                            posterPath={
                              mediaMap.get(item.showId)?.posterPath ?? null
                            }
                          />

                          <ReplyForm
                            reviewId={item.id}
                            mediaTitle={
                              mediaMap.get(item.showId)?.title ?? "Title"
                            }
                            posterPath={
                              mediaMap.get(item.showId)?.posterPath ?? null
                            }
                            onSubmit={replyReviewAction}
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] md:p-5 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gray-400">
                    <List className="h-4 w-4 text-primaryM-500" />
                    <span>Your Lists</span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-gray-300">
                    All of your custom lists in one place.
                  </p>
                </div>
                {isOwner ? (
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Link href="/bookmarks">Open full lists</Link>
                  </Button>
                ) : null}
              </div>

              {customBookmarksWithMovies.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-5 text-sm text-gray-300">
                  {isOwner
                    ? "You do not have any lists yet."
                    : "This user has no lists yet."}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                  {customBookmarksWithMovies.map(({ list, movies, role }) => (
                    <Link
                      key={list.id}
                      href={`/list/${list.id}`}
                      className="block h-full min-h-[150px] w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-primaryM-500/40 hover:bg-white/[0.05]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-1 text-lg font-semibold text-white">
                            {list.bookmarkName}
                          </h3>
                          <span
                            className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.16em] ${
                              role === "owner"
                                ? "bg-primaryM-500/12 border-primaryM-500/40 text-primaryM-300"
                                : "bg-sky-500/12 border-sky-400/35 text-sky-300"
                            }`}
                          >
                            {role === "owner" ? "Owner" : "Collaborator"}
                          </span>
                          <p className="mt-1 line-clamp-3 break-words text-sm text-gray-300">
                            {list.description}
                          </p>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-gray-300">
                          {movies.length} item{movies.length === 1 ? "" : "s"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
