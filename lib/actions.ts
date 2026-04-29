"use server";

import { auth, signIn } from "@/auth";
import {
  bookmarks,
  bookmarksMovies,
  loggedMovies,
  reviewLikes,
  reviewReplies,
  listLikes,
  userFollows,
  users,
  notifications,
  listCollaborators,
} from "@/db/schema";
import { db } from "@/db";
import { and, desc, eq, inArray, ne, sum, avg, count } from "drizzle-orm";
import { signOut } from "@/auth";
import {
  bookmarksMoviesSchema,
  bookmarksSchema,
  usersSchema,
} from "@/types/index";
import { z } from "zod";
import { TsearchMovie, TspecifiedMovie } from "@/types/api";
import axios from "axios";
import { TspecifiedTv } from "@/types/apiTv";
import { TvideoApiSchema } from "@/types/video";
import { TCreditsSchema } from "@/types/cast";
import { cache } from "react";
import { log } from "console";
import {
  StoredMediaType,
  encodeStoredMediaId,
  decodeStoredMediaId,
} from "@/lib/utils";
import { tmdbFetch, TMDBApiError } from "@/lib/tmdb-api";

//------------------------------------------------------------------------#uilities for handlingath
cache;

// USED CACHE TO PERFORM APP, CHECK WEB CODY DEV VIDEO https://youtu.be/8vJ3JC9O2Eo

export const getUser = cache(async () => {
  try {
    const session = await auth();
    return session?.user ?? null;
  } catch {
    return null;
  }
});

export async function getCurrentUserDbProfile() {
  const user = await getUser();

  if (!user?.id) return null;

  try {
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        image: users.image,
        bio: users.bio,
        backdropPath: users.backdropPath,
        premium: users.premium,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    if (!isMissingUserProfileColumns(error)) throw error;

    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const profile = rows[0];
    if (!profile) return null;

    return {
      ...profile,
      bio: null,
      backdropPath: null,
      premium: false,
    };
  }
}

export async function getUserDbProfileByUsername(usernameInput: string) {
  const username = normalizeUsername(usernameInput);

  try {
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        premium: users.premium,
        name: users.name,
        email: users.email,
        image: users.image,
        bio: users.bio,
        backdropPath: users.backdropPath,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    if (!isMissingUserProfileColumns(error)) throw error;

    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        image: users.image,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    const profile = rows[0];
    if (!profile) return null;

    return {
      ...profile,
      premium: false,
      bio: null,
      backdropPath: null,
    };
  }
}

export async function getUserDbProfileById(userId: string) {
  try {
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        image: users.image,
        bio: users.bio,
        backdropPath: users.backdropPath,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    if (!isMissingUserProfileColumns(error)) throw error;

    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const profile = rows[0];
    if (!profile) return null;

    return {
      ...profile,
      bio: null,
      backdropPath: null,
    };
  }
}

export async function getSession() {
  const session = await auth();
  return session;
}

// auth utilites
export async function handleLogout() {
  await signOut();
}

type provider = "github" | "google" | "twitter" | "facebook" | "reddit";
export async function handleSignin(provider: provider) {
  await signIn(provider, { callbackUrl: "/explore" });
}

function normalizeUsername(input: string) {
  return input.trim().toLowerCase();
}

const SYSTEM_LIKES_KEYWORDS = ["likes", "like", "liked", "love", "loved"];
const SYSTEM_WATCHLIST_KEYWORDS = [
  "watchlist",
  "watch later",
  "to watch",
  "queue",
];
const SYSTEM_FAVORITES_KEYWORDS = ["favorite", "favourite", "fav"];

function normalizeListName(input: string) {
  return input.trim().toLowerCase();
}

function matchesAnyListKeyword(value: string, keywords: string[]) {
  const normalized = normalizeListName(value);
  return keywords.some((keyword) => normalized.includes(keyword));
}

function isSystemListName(name: string) {
  return (
    matchesAnyListKeyword(name, SYSTEM_FAVORITES_KEYWORDS) ||
    matchesAnyListKeyword(name, SYSTEM_LIKES_KEYWORDS) ||
    matchesAnyListKeyword(name, SYSTEM_WATCHLIST_KEYWORDS)
  );
}

async function cleanupSystemListCollaborations() {
  const rows = await db
    .select({ id: bookmarks.id, bookmarkName: bookmarks.bookmarkName })
    .from(bookmarks);

  const systemListIds = rows
    .filter((row) => isSystemListName(row.bookmarkName))
    .map((row) => row.id);

  if (systemListIds.length === 0) return 0;

  await db
    .delete(listCollaborators)
    .where(inArray(listCollaborators.bookmarkId, systemListIds));

  return systemListIds.length;
}

function getStoredMovieIdCandidates(
  id: string | number,
  mediaType?: StoredMediaType,
) {
  const raw = String(id).trim();
  const candidates = new Set<string>();

  if (raw) {
    candidates.add(raw);
    candidates.add(encodeStoredMediaId(raw, "movie"));
    candidates.add(encodeStoredMediaId(raw, "tv"));
  }

  if (mediaType) {
    candidates.add(encodeStoredMediaId(raw, mediaType));
  }

  return [...candidates];
}

async function ensureDefaultSystemListsForUser(userId: string) {
  const current = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));

  const hasLikes = current.some((list) =>
    matchesAnyListKeyword(list.bookmarkName, SYSTEM_LIKES_KEYWORDS),
  );
  const hasWatchlist = current.some((list) =>
    matchesAnyListKeyword(list.bookmarkName, SYSTEM_WATCHLIST_KEYWORDS),
  );

  const creates: Promise<unknown>[] = [];

  if (!hasLikes) {
    creates.push(
      db.insert(bookmarks).values({
        bookmarkName: "likes",
        description: "Movies and shows you like",
        userId,
      }),
    );
  }

  if (!hasWatchlist) {
    creates.push(
      db.insert(bookmarks).values({
        bookmarkName: "watchlist",
        description: "Movies and Tv shows you want to watch",
        userId,
      }),
    );
  }

  if (creates.length > 0) {
    await Promise.all(creates);
  }
}

function isValidUsername(username: string) {
  return /^[a-z0-9_]{3,24}$/.test(username);
}

const profileUpdateSchema = z.object({
  username: z.string().trim().min(3).max(24),
  bio: z.string().trim().max(240).optional().nullable(),
  image: z.string().url().optional().nullable(),
  backdropPath: z.string().trim().max(255).optional().nullable(),
});

function isAllowedProfileImageUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;

    const host = parsed.hostname.toLowerCase();
    return host.includes("utfs.io") || host.includes("ufs.sh");
  } catch {
    return false;
  }
}

export async function isUsernameAvailable(
  usernameInput: string,
  excludeUserId?: string,
) {
  const username = normalizeUsername(usernameInput);

  if (!isValidUsername(username)) {
    return { available: false as const, reason: "invalid" as const };
  }

  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(
      excludeUserId
        ? and(eq(users.username, username), ne(users.id, excludeUserId))
        : eq(users.username, username),
    )
    .limit(1);

  return {
    available: rows.length === 0,
    reason: rows.length === 0 ? null : ("taken" as const),
  };
}

export async function completeUsernameSetup(usernameInput: string) {
  const user = await getUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const username = normalizeUsername(usernameInput);
  const validity = await isUsernameAvailable(username, user.id);

  if (!validity.available) {
    return {
      ok: false as const,
      error:
        validity.reason === "invalid"
          ? "Username must be 3-24 chars and use only lowercase letters, numbers, or underscores."
          : "That username is already taken.",
    };
  }

  await db.update(users).set({ username }).where(eq(users.id, user.id));

  return { ok: true as const, username };
}

export async function updateMyProfile(input: {
  username?: string;
  bio?: string | null;
  image?: string | null;
  backdropPath?: string | null;
}) {
  const user = await getUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const parsed = profileUpdateSchema.safeParse({
    username: String(input.username ?? ""),
    bio: input.bio ?? null,
    image: input.image ?? null,
    backdropPath: input.backdropPath ?? null,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message ?? "Invalid profile data";
    return { ok: false as const, error: issue };
  }

  const normalizedUsername = normalizeUsername(parsed.data.username);
  const usernameValidity = await isUsernameAvailable(
    normalizedUsername,
    user.id,
  );

  if (!usernameValidity.available) {
    return {
      ok: false as const,
      error:
        usernameValidity.reason === "invalid"
          ? "Username must be 3-24 chars and use only lowercase letters, numbers, or underscores."
          : "That username is already taken.",
    };
  }

  const nextBio = parsed.data.bio?.trim() || null;
  const nextImage = parsed.data.image?.trim() || null;
  const nextBackdropPath = parsed.data.backdropPath?.trim() || null;

  if (nextImage && !isAllowedProfileImageUrl(nextImage)) {
    return {
      ok: false as const,
      error: "Invalid profile image URL. Please upload via UploadThing.",
    };
  }

  await db
    .update(users)
    .set({
      username: normalizedUsername,
      bio: nextBio,
      image: nextImage,
      backdropPath: nextBackdropPath,
    })
    .where(eq(users.id, user.id));

  return {
    ok: true as const,
    username: normalizedUsername,
    bio: nextBio,
    image: nextImage,
    backdropPath: nextBackdropPath,
  };
}

export async function followUserByUsername(targetUsernameInput: string) {
  const user = await getUser();
  if (!user?.id) throw new Error("User not authenticated");

  const targetUsername = normalizeUsername(targetUsernameInput);
  const target = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, targetUsername))
    .limit(1);

  const targetUser = target[0];
  if (!targetUser) return { ok: false as const, reason: "not-found" as const };
  if (targetUser.id === user.id)
    return { ok: false as const, reason: "self" as const };

  const alreadyFollowing = await db
    .select({ followerId: userFollows.followerId })
    .from(userFollows)
    .where(
      and(
        eq(userFollows.followerId, user.id),
        eq(userFollows.followingId, targetUser.id),
      ),
    )
    .limit(1);

  await db
    .insert(userFollows)
    .values({ followerId: user.id, followingId: targetUser.id })
    .onConflictDoNothing();

  if (!alreadyFollowing[0]) {
    await createNotification({
      userId: targetUser.id,
      type: "follow",
      sourceUserId: user.id,
      message: `${user.name ?? "Someone"} started following you`,
    });
  }

  return { ok: true as const };
}

export async function unfollowUserByUsername(targetUsernameInput: string) {
  const user = await getUser();
  if (!user?.id) throw new Error("User not authenticated");

  const targetUsername = normalizeUsername(targetUsernameInput);
  const target = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, targetUsername))
    .limit(1);

  const targetUser = target[0];
  if (!targetUser) return { ok: false as const, reason: "not-found" as const };

  await db
    .delete(userFollows)
    .where(
      and(
        eq(userFollows.followerId, user.id),
        eq(userFollows.followingId, targetUser.id),
      ),
    );

  return { ok: true as const };
}

export async function getUserSocialStats(profileUserId: string) {
  try {
    const viewer = await getUser();

    const [followers, following] = await Promise.all([
      db
        .select({ followerId: userFollows.followerId })
        .from(userFollows)
        .where(eq(userFollows.followingId, profileUserId)),
      db
        .select({ followingId: userFollows.followingId })
        .from(userFollows)
        .where(eq(userFollows.followerId, profileUserId)),
    ]);

    const viewerId = viewer?.id;
    const followerIds = new Set(followers.map((row) => row.followerId));
    const followingIds = new Set(following.map((row) => row.followingId));
    const friendsCount = [...followerIds].filter((id) =>
      followingIds.has(id),
    ).length;

    const isFollowing =
      typeof viewerId === "string"
        ? followers.some((row) => row.followerId === viewerId)
        : false;

    const followsViewer =
      typeof viewerId === "string"
        ? following.some((row) => row.followingId === viewerId)
        : false;

    return {
      followersCount: followers.length,
      followingCount: following.length,
      friendsCount,
      isFollowing,
      followsViewer,
      isFriend: isFollowing && followsViewer,
    };
  } catch (error) {
    if (!isSchemaDriftError(error)) throw error;

    return {
      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
      isFollowing: false,
      followsViewer: false,
      isFriend: false,
    };
  }
}

export async function getUserConnections(
  profileUserId: string,
  kind: "followers" | "following" | "friends",
) {
  const [followers, following] = await Promise.all([
    db
      .select({ followerId: userFollows.followerId })
      .from(userFollows)
      .where(eq(userFollows.followingId, profileUserId)),
    db
      .select({ followingId: userFollows.followingId })
      .from(userFollows)
      .where(eq(userFollows.followerId, profileUserId)),
  ]);

  const followerIds = followers.map((row) => row.followerId);
  const followingIds = following.map((row) => row.followingId);
  const followingSet = new Set(followingIds);

  const targetIds =
    kind === "followers"
      ? followerIds
      : kind === "following"
        ? followingIds
        : followerIds.filter((id) => followingSet.has(id));

  if (targetIds.length === 0) return [];

  const connectionUsers = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      image: users.image,
      email: users.email,
    })
    .from(users)
    .where(inArray(users.id, targetIds));

  return connectionUsers;
}

export async function toggleReviewLike(reviewId: string) {
  const user = await getUser();
  if (!user?.id) throw new Error("User not authenticated");

  const existing = await db
    .select({ id: reviewLikes.id })
    .from(reviewLikes)
    .where(
      and(eq(reviewLikes.userId, user.id), eq(reviewLikes.reviewId, reviewId)),
    )
    .limit(1);

  if (existing[0]) {
    await db.delete(reviewLikes).where(eq(reviewLikes.id, existing[0].id));
    return { liked: false as const };
  }

  await db.insert(reviewLikes).values({
    userId: user.id,
    reviewId,
  });

  const targetReview = await db
    .select({ userId: loggedMovies.userId })
    .from(loggedMovies)
    .where(eq(loggedMovies.id, reviewId))
    .limit(1);

  const reviewOwnerId = targetReview[0]?.userId;
  if (reviewOwnerId && reviewOwnerId !== user.id) {
    await createNotification({
      userId: reviewOwnerId,
      type: "review_like",
      sourceUserId: user.id,
      referenceId: reviewId,
      message: `${user.name ?? "Someone"} liked your review`,
    });
  }

  return { liked: true as const };
}

export async function addReviewReply(reviewId: string, content: string) {
  const user = await getUser();
  if (!user?.id) throw new Error("User not authenticated");

  const normalizedContent = content.trim();
  if (normalizedContent.length < 1 || normalizedContent.length > 500) {
    return {
      ok: false as const,
      error: "Reply must be between 1 and 500 characters.",
    };
  }

  const inserted = await db
    .insert(reviewReplies)
    .values({
      userId: user.id,
      reviewId,
      content: normalizedContent,
    })
    .returning({ id: reviewReplies.id, createdAt: reviewReplies.createdAt });

  const targetReview = await db
    .select({ userId: loggedMovies.userId })
    .from(loggedMovies)
    .where(eq(loggedMovies.id, reviewId))
    .limit(1);

  const reviewOwnerId = targetReview[0]?.userId;
  if (reviewOwnerId && reviewOwnerId !== user.id) {
    await createNotification({
      userId: reviewOwnerId,
      type: "review_reply",
      sourceUserId: user.id,
      referenceId: reviewId,
      message: `${user.name ?? "Someone"} replied to your review`,
    });
  }

  return { ok: true as const, reply: inserted[0] };
}

export async function getReviewEngagement(reviewId: string) {
  try {
    const viewer = await getUser();
    const [likes, replies] = await Promise.all([
      db
        .select({ id: reviewLikes.id, userId: reviewLikes.userId })
        .from(reviewLikes)
        .where(eq(reviewLikes.reviewId, reviewId)),
      db
        .select({
          id: reviewReplies.id,
          content: reviewReplies.content,
          createdAt: reviewReplies.createdAt,
          userId: reviewReplies.userId,
          username: users.username,
          image: users.image,
        })
        .from(reviewReplies)
        .leftJoin(users, eq(users.id, reviewReplies.userId))
        .where(eq(reviewReplies.reviewId, reviewId))
        .orderBy(desc(reviewReplies.createdAt)),
    ]);

    return {
      likesCount: likes.length,
      viewerLiked: viewer?.id
        ? likes.some((like) => like.userId === viewer.id)
        : false,
      replies,
    };
  } catch (error) {
    if (!isSchemaDriftError(error)) throw error;
    return {
      likesCount: 0,
      viewerLiked: false,
      replies: [],
    };
  }
}

export async function getBookmarkById(bookmarkId: string) {
  const rows = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.id, bookmarkId))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateBookmarkDetails(data: {
  bookmarkId: string;
  bookmarkName: string;
  description: string;
}) {
  const user = await getUser();
  if (!user?.id) throw new Error("User not authenticated");

  const bookmark = await getBookmarkById(data.bookmarkId);
  if (!bookmark) throw new Error("List not found");
  if (bookmark.userId !== user.id) throw new Error("Not allowed");
  if (isSystemListName(bookmark.bookmarkName)) {
    throw new Error("System lists cannot be renamed or edited");
  }

  const bookmarkName = data.bookmarkName.trim();
  const description = data.description.trim();

  if (!bookmarkName) throw new Error("List name is required");
  if (!description) throw new Error("List description is required");

  await db
    .update(bookmarks)
    .set({ bookmarkName, description, updatedAt: new Date() })
    .where(eq(bookmarks.id, data.bookmarkId));

  return { ok: true as const };
}

export async function removeMovieFromBookmark(data: {
  bookmarkId: string;
  movieId: string | number;
}) {
  const user = await getUser();
  if (!user?.id) throw new Error("User not authenticated");

  const bookmark = await getBookmarkById(data.bookmarkId);
  if (!bookmark) throw new Error("List not found");

  const canEdit = await canUserEditBookmark(data.bookmarkId);
  if (!canEdit) throw new Error("Not allowed");

  return RemoveMovie(data);
}

export async function toggleListLike(bookmarkId: string) {
  const user = await getUser();
  if (!user?.id) throw new Error("User not authenticated");

  const bookmark = await getBookmarkById(bookmarkId);
  if (!bookmark) throw new Error("List not found");
  if (isSystemListName(bookmark.bookmarkName)) {
    throw new Error("System lists cannot be liked");
  }

  const existing = await db
    .select({ id: listLikes.id })
    .from(listLikes)
    .where(
      and(eq(listLikes.userId, user.id), eq(listLikes.bookmarkId, bookmarkId)),
    )
    .limit(1);

  if (existing[0]) {
    await db.delete(listLikes).where(eq(listLikes.id, existing[0].id));
    return { liked: false as const };
  }

  await db.insert(listLikes).values({
    userId: user.id,
    bookmarkId,
  });

  return { liked: true as const };
}

export async function getListLikeStats(bookmarkId: string) {
  const bookmark = await getBookmarkById(bookmarkId);
  if (!bookmark) return { likesCount: 0, viewerLiked: false };
  if (isSystemListName(bookmark.bookmarkName)) {
    return { likesCount: 0, viewerLiked: false };
  }

  const viewer = await getUser();
  const likes = await db
    .select({ userId: listLikes.userId })
    .from(listLikes)
    .where(eq(listLikes.bookmarkId, bookmarkId));

  return {
    likesCount: likes.length,
    viewerLiked: viewer?.id
      ? likes.some((row) => row.userId === viewer.id)
      : false,
  };
}
//------------------------------------------------------------------------#uilities for fetching data from the database

//   fetching only the bookmarks of the user

type bookSchemaType = z.infer<typeof bookmarksSchema>;
export async function getBookmarks(userId: string): Promise<bookSchemaType[]> {
  try {
    await ensureDefaultSystemListsForUser(userId);
  } catch (error) {
    if (!isSchemaDriftError(error)) throw error;
  }

  try {
    await cleanupSystemListCollaborations();
  } catch (error) {
    if (!isSchemaDriftError(error)) throw error;
  }

  const boks = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));
  // const validatedBoks = boks.map((bookmark) => bookmarksSchema.parse(bookmark));
  //TODO CHECK WHY VALIDATING IS NOT WORKING

  return boks as bookSchemaType[];
}

//   fetch only movies of specied bookmark of that specified user

type moviesBookSchemaType = z.infer<typeof bookmarksMoviesSchema>;

export async function getMoviesBook(
  bookmarkId: string,
): Promise<moviesBookSchemaType[]> {
  // Fetch the movies with the given bookmarkId from the database
  const bookmarkMovies = await db
    .select()
    .from(bookmarksMovies)
    .where(eq(bookmarksMovies.bookmarkId, bookmarkId));

  return bookmarkMovies;
}

//   fetch only SPECIFIED MOVIEID FROM BOOKMARKSMOVIES
export async function getMovieLists(
  movieId: string,
): Promise<moviesBookSchemaType[]> {
  // Fetch the movies with the given bookmarkId from the database
  const bookmarkMovies = await db
    .select()
    .from(bookmarksMovies)
    .where(eq(bookmarksMovies.movieId, movieId));

  return bookmarkMovies;
}

export type TUserLoggedMovieEntry = {
  id: string;
  showId: string;
  rating: number | null;
  review: string;
  watchedAt: Date;
  createdAt: Date | null;
  watchType: "first" | "rewatch";
};

export async function getLoggedMoviesForUser(
  userId: string,
): Promise<TUserLoggedMovieEntry[]> {
  try {
    const rows = await db
      .select({
        id: loggedMovies.id,
        showId: loggedMovies.showId,
        rating: loggedMovies.rating,
        review: loggedMovies.review,
        watchedAt: loggedMovies.watchedAt,
        createdAt: loggedMovies.createdAt,
        watchType: loggedMovies.watchType,
      })
      .from(loggedMovies)
      .where(eq(loggedMovies.userId, userId))
      .orderBy(desc(loggedMovies.createdAt));

    return rows.map((row) => ({
      id: row.id,
      showId: row.showId,
      rating: typeof row.rating === "number" ? row.rating : null,
      review: row.review ?? "",
      watchedAt: row.watchedAt,
      createdAt: row.createdAt ?? null,
      watchType: row.watchType === "rewatch" ? "rewatch" : "first",
    }));
  } catch (error) {
    if (!isMissingWatchTypeColumn(error)) throw error;

    const rows = await db
      .select({
        id: loggedMovies.id,
        showId: loggedMovies.showId,
        rating: loggedMovies.rating,
        review: loggedMovies.review,
        watchedAt: loggedMovies.watchedAt,
        createdAt: loggedMovies.createdAt,
      })
      .from(loggedMovies)
      .where(eq(loggedMovies.userId, userId))
      .orderBy(desc(loggedMovies.createdAt));

    return rows.map((row) => ({
      id: row.id,
      showId: row.showId,
      rating: typeof row.rating === "number" ? row.rating : null,
      review: row.review ?? "",
      watchedAt: row.watchedAt,
      createdAt: row.createdAt ?? null,
      watchType: "first",
    }));
  }
}

//---------------------- handling adding movie

export async function AddMovie(data: {
  bookmarkId: string;
  review?: string;
  movieId: string | number;
  mediaType?: StoredMediaType;
}) {
  if (!data.review) data.review = "";

  const storedMovieId = encodeStoredMediaId(data.movieId, data.mediaType);

  // handling movie if already on watchList or not
  const existingMovie = await getMoviesBook(data.bookmarkId);
  const existingMovieResponse = existingMovie.some(
    (movie) => movie.movieId === storedMovieId,
  );

  if (existingMovieResponse) return { already: true };
  if (!existingMovieResponse) {
    await db.insert(bookmarksMovies).values({
      bookmarkId: data.bookmarkId as string,
      review: data.review,
      movieId: storedMovieId,
    });

    const actor = await getUser();
    const bookmark = await getBookmarkById(data.bookmarkId);
    if (actor?.id && bookmark?.userId && bookmark.userId !== actor.id) {
      await createNotification({
        userId: bookmark.userId,
        type: "list_update",
        sourceUserId: actor.id,
        referenceId: data.bookmarkId,
        message: `${actor.name ?? "A collaborator"} added a title to your list`,
      });
    }

    return { already: false };
  }
}

export async function RemoveMovie(data: {
  bookmarkId: string;
  movieId: string | number;
  mediaType?: StoredMediaType;
}) {
  const existingMovie = await getMoviesBook(data.bookmarkId);
  const candidates = getStoredMovieIdCandidates(data.movieId, data.mediaType);
  const match = existingMovie.find((movie) =>
    candidates.includes(movie.movieId),
  );

  if (!match) return { removed: false as const };

  await db.delete(bookmarksMovies).where(eq(bookmarksMovies.id, match.id));

  const actor = await getUser();
  const bookmark = await getBookmarkById(data.bookmarkId);
  if (actor?.id && bookmark?.userId && bookmark.userId !== actor.id) {
    await createNotification({
      userId: bookmark.userId,
      type: "list_update",
      sourceUserId: actor.id,
      referenceId: data.bookmarkId,
      message: `${actor.name ?? "A collaborator"} removed a title from your list`,
    });
  }

  return { removed: true as const };
}

export async function addMovieToProfileSection(data: {
  section: "favorites" | "likes" | "watchlist";
  movieId: string | number;
  mediaType?: StoredMediaType;
}) {
  const user = await getUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const bookmarksForUser = await getBookmarks(user.id);

  const sectionConfig = {
    favorites: {
      listName: "favorites",
      description: "Your favorite movies and TV shows",
      matcher: (value: string) =>
        ["favorite", "favourite", "fav"].some((key) =>
          value.toLowerCase().includes(key),
        ),
    },
    likes: {
      listName: "likes",
      description: "Movies and shows you like",
      matcher: (value: string) =>
        ["like", "liked", "love", "loved"].some((key) =>
          value.toLowerCase().includes(key),
        ),
    },
    watchlist: {
      listName: "watchlist",
      description: "Movies and Tv shows you want to watch",
      matcher: (value: string) =>
        ["watchlist", "watch later", "to watch", "queue"].some((key) =>
          value.toLowerCase().includes(key),
        ),
    },
  }[data.section];

  const existingList = bookmarksForUser.find((bookmark) =>
    sectionConfig.matcher(bookmark.bookmarkName),
  );

  const targetListId = existingList
    ? existingList.id
    : (
        await CreateBookmark({
          bookmarkName: sectionConfig.listName,
          userId: user.id,
          description: sectionConfig.description,
        })
      ).id;

  const response = await AddMovie({
    bookmarkId: targetListId,
    movieId: String(data.movieId),
    mediaType: data.mediaType,
    review: "",
  });

  return {
    listId: targetListId,
    already: response?.already ?? false,
  };
}
//---------------------------

export async function CreateBookmark(data: {
  bookmarkName: string;
  userId: string;
  description: string;
}) {
  const insert = await db
    .insert(bookmarks)
    .values({
      bookmarkName: data.bookmarkName,
      userId: data.userId,
      description: data.description,
    })
    .returning({ id: bookmarks.id });
  // console.log(insert);
  return insert[0];
}

//------------------------------------------------------------------------#uilities for fetching data from the api##

//---- utilites for specified movie
export async function getSpecifiedMovie(id: string): Promise<TspecifiedMovie> {
  try {
    return await tmdbFetch<TspecifiedMovie>(
      `/movie/${id}`,
      {},
      `getSpecifiedMovie(${id})`
    );
  } catch (error) {
    throw error instanceof TMDBApiError ? error : new Error("Failed to fetch movie");
  }
}

// utilite for specified tv show
export async function getSpecifiedTV(id: string): Promise<TspecifiedTv> {
  try {
    return await tmdbFetch<TspecifiedTv>(
      `/tv/${id}`,
      {},
      `getSpecifiedTV(${id})`
    );
  } catch (error) {
    throw error instanceof TMDBApiError ? error : new Error("Failed to fetch TV show");
  }
}

//---general utilites for fetching data from the api

export async function getSpecifiedTVMovieVideos(
  id: string,
  typeM: "movie" | "tv",
): Promise<TvideoApiSchema> {
  try {
    return await tmdbFetch<TvideoApiSchema>(
      `/${typeM}/${id}/videos`,
      { language: "en-US" },
      `getSpecifiedTVMovieVideos(${id}, ${typeM})`
    );
  } catch (error) {
    throw error instanceof TMDBApiError ? error : new Error("Failed to fetch videos");
  }
}

export async function getCreditsTVMovie(
  id: string,
  typeM: "movie" | "tv",
): Promise<TCreditsSchema> {
  try {
    return await tmdbFetch<TCreditsSchema>(
      `/${typeM}/${id}/credits`,
      {},
      `getCreditsTVMovie(${id}, ${typeM})`
    );
  } catch (error) {
    throw error instanceof TMDBApiError ? error : new Error("Failed to fetch credits");
  }
}

// utilite for search page

type values = {
  query: string;
  page: number;
};
export async function getSearchMovie(values: values): Promise<TsearchMovie> {
  try {
    return await tmdbFetch<TsearchMovie>(
      `/search/multi`,
      {
        query: values.query,
        include_adult: true,
        language: "en-US",
        page: values.page,
      },
      `getSearchMovie(query: ${values.query})`
    );
  } catch (error) {
    throw error instanceof TMDBApiError ? error : new Error("Failed to search movies");
  }
}

export type TSimilarItem = {
  id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
};

export type TReviewItem = {
  id: string;
  author: string;
  authorUsername?: string | null;
  authorUserId?: string | null;
  content: string;
  created_at: string;
  source?: "you" | "friend" | "following" | "community" | "tmdb";
  author_details?: {
    avatar_path?: string | null;
    rating?: number | null;
  };
};

export type TImageItem = {
  file_path: string;
  width: number;
  height: number;
  vote_average: number;
};

export type TWatchProviderItem = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
};

export type TWatchProvidersData = {
  link: string | null;
  flatrate: TWatchProviderItem[];
  rent: TWatchProviderItem[];
  buy: TWatchProviderItem[];
};

export type TTvEpisodeItem = {
  id: number;
  name: string;
  episode_number: number;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
};

export type TTvSeasonDetails = {
  id: number;
  name: string;
  season_number: number;
  episodes: TTvEpisodeItem[];
};

export type TTvEpisodePerson = {
  id: number;
  name: string;
  profile_path: string | null;
  character?: string;
  job?: string;
  department?: string;
};

export type TTvEpisodeDetails = {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  crew: TTvEpisodePerson[];
  guest_stars: TTvEpisodePerson[];
};

export type TPersonDetails = {
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  known_for_department: string;
  name: string;
  place_of_birth: string | null;
  popularity: number;
  profile_path: string | null;
};

export type TPersonCreditItem = {
  id: number;
  media_type: "movie" | "tv";
  genre_ids: number[];
  poster_path: string | null;
  backdrop_path: string | null;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  character?: string;
  job?: string;
  vote_average: number;
  popularity: number;
};

export type TPersonCombinedCredits = {
  cast: TPersonCreditItem[];
  crew: TPersonCreditItem[];
};

export type TPersonImageItem = {
  file_path: string;
  width: number;
  height: number;
  vote_average: number;
};

export async function getSimilarByType(
  id: string,
  typeM: "movie" | "tv",
): Promise<TSimilarItem[]> {
  try {
    const data = await tmdbFetch<{ results: TSimilarItem[] }>(
      `/${typeM}/${id}/similar`,
      { language: "en-US", page: 1 },
      `getSimilarByType(${id}, ${typeM})`
    );
    return data?.results ?? [];
  } catch {
    return [];
  }
}

export async function getReviewsByType(
  id: string,
  typeM: "movie" | "tv",
): Promise<TReviewItem[]> {
  const socialReviews = await getSocialReviewsByType(id);

  let tmdbReviews: TReviewItem[] = [];
  try {
    const data = await tmdbFetch<{ results: TReviewItem[] }>(
      `/${typeM}/${id}/reviews`,
      { language: "en-US", page: 1 },
      `getReviewsByType(${id}, ${typeM})`
    );
    const results = Array.isArray(data?.results) ? data.results : [];
    tmdbReviews = results.map((item: TReviewItem) => ({
      ...item,
      source: "tmdb",
    }));
  } catch {
    tmdbReviews = [];
  }

  return [...socialReviews, ...tmdbReviews];
}

async function getSocialReviewsByType(id: string): Promise<TReviewItem[]> {
  const viewer = await getUser();
  const rawRows = await db
    .select({
      reviewId: loggedMovies.id,
      userId: loggedMovies.userId,
      review: loggedMovies.review,
      rating: loggedMovies.rating,
      watchedAt: loggedMovies.watchedAt,
      createdAt: loggedMovies.createdAt,
      username: users.username,
      name: users.name,
      image: users.image,
    })
    .from(loggedMovies)
    .leftJoin(users, eq(users.id, loggedMovies.userId))
    .where(eq(loggedMovies.showId, id))
    .orderBy(desc(loggedMovies.createdAt));

  const normalizedRows = rawRows
    .map((row) => ({
      ...row,
      review: (row.review ?? "").trim(),
      createdAtDate: row.createdAt ?? row.watchedAt,
    }))
    .filter((row) => row.review.length > 0 || row.rating !== null);

  // Keep one review per person (their most recent one for this title).
  const byUser = new Map<string, (typeof normalizedRows)[number]>();
  normalizedRows.forEach((row) => {
    if (!byUser.has(row.userId)) {
      byUser.set(row.userId, row);
    }
  });

  if (byUser.size === 0) return [];

  const viewerId = viewer?.id ?? null;
  let friendSet = new Set<string>();
  let followingSet = new Set<string>();

  if (viewerId) {
    const [followingRows, followerRows] = await Promise.all([
      db
        .select({ followingId: userFollows.followingId })
        .from(userFollows)
        .where(eq(userFollows.followerId, viewerId)),
      db
        .select({ followerId: userFollows.followerId })
        .from(userFollows)
        .where(eq(userFollows.followingId, viewerId)),
    ]);

    const followingIds = followingRows.map((row) => row.followingId);
    const followerSet = new Set(followerRows.map((row) => row.followerId));
    const friendIds = followingIds.filter((userId) => followerSet.has(userId));

    friendSet = new Set(friendIds);
    followingSet = new Set(
      followingIds.filter((userId) => !friendSet.has(userId)),
    );
  }

  const viewerReviews: TReviewItem[] = [];
  const friendReviews: TReviewItem[] = [];
  const followingReviews: TReviewItem[] = [];
  const communityReviews: TReviewItem[] = [];

  byUser.forEach((row) => {
    const ratingOutOfTen =
      typeof row.rating === "number"
        ? Number((row.rating * 2).toFixed(1))
        : null;

    const base: TReviewItem = {
      id: `local-${row.reviewId}`,
      author: row.name || row.username || "User",
      authorUsername: row.username ?? null,
      authorUserId: row.userId,
      content: row.review,
      created_at: row.createdAtDate.toISOString(),
      author_details: {
        avatar_path: row.image,
        rating: ratingOutOfTen,
      },
    };

    if (viewerId && row.userId === viewerId) {
      viewerReviews.push({ ...base, source: "you" });
      return;
    }

    if (viewerId && friendSet.has(row.userId)) {
      friendReviews.push({ ...base, source: "friend" });
      return;
    }

    if (viewerId && followingSet.has(row.userId)) {
      followingReviews.push({ ...base, source: "following" });
      return;
    }

    communityReviews.push({ ...base, source: "community" });
  });

  const sortNewestFirst = (left: TReviewItem, right: TReviewItem) =>
    new Date(right.created_at).getTime() - new Date(left.created_at).getTime();

  viewerReviews.sort(sortNewestFirst);
  friendReviews.sort(sortNewestFirst);
  followingReviews.sort(sortNewestFirst);
  communityReviews.sort(sortNewestFirst);

  return [
    ...viewerReviews,
    ...friendReviews,
    ...followingReviews,
    ...communityReviews,
  ];
}

export type TWatchedByItem = {
  userId: string;
  username: string | null;
  name: string | null;
  image: string | null;
  rating: number | null;
  watchedAt: Date;
  source: "friend" | "following";
};

export async function getWatchedByForShow(
  showId: string,
): Promise<TWatchedByItem[]> {
  const viewer = await getUser();
  if (!viewer?.id) return [];

  const [followingRows, followerRows] = await Promise.all([
    db
      .select({ followingId: userFollows.followingId })
      .from(userFollows)
      .where(eq(userFollows.followerId, viewer.id)),
    db
      .select({ followerId: userFollows.followerId })
      .from(userFollows)
      .where(eq(userFollows.followingId, viewer.id)),
  ]);

  const followingIds = followingRows.map((row) => row.followingId);
  const followerSet = new Set(followerRows.map((row) => row.followerId));
  const friendIds = followingIds.filter((userId) => followerSet.has(userId));
  const friendSet = new Set(friendIds);
  const followingOnlyIds = followingIds.filter(
    (userId) => !friendSet.has(userId),
  );
  const targetIds = [...friendIds, ...followingOnlyIds];

  if (targetIds.length === 0) return [];

  const rows = await db
    .select({
      userId: loggedMovies.userId,
      rating: loggedMovies.rating,
      watchedAt: loggedMovies.watchedAt,
      createdAt: loggedMovies.createdAt,
      username: users.username,
      name: users.name,
      image: users.image,
    })
    .from(loggedMovies)
    .leftJoin(users, eq(users.id, loggedMovies.userId))
    .where(
      and(
        eq(loggedMovies.showId, showId),
        inArray(loggedMovies.userId, targetIds),
      ),
    )
    .orderBy(desc(loggedMovies.createdAt));

  // Keep only the most recent watch for each person.
  const byUser = new Map<string, (typeof rows)[number]>();
  rows.forEach((row) => {
    if (!byUser.has(row.userId)) {
      byUser.set(row.userId, row);
    }
  });

  const watchedBy: TWatchedByItem[] = [];
  byUser.forEach((row) => {
    const watchedAt = row.createdAt ?? row.watchedAt;
    if (!watchedAt) return;

    watchedBy.push({
      userId: row.userId,
      username: row.username,
      name: row.name,
      image: row.image,
      rating: row.rating,
      watchedAt,
      source: friendSet.has(row.userId) ? "friend" : "following",
    });
  });

  watchedBy.sort(
    (left, right) => right.watchedAt.getTime() - left.watchedAt.getTime(),
  );
  return watchedBy;
}

export async function getCategorizedReviewsByType(params: {
  id: string;
  typeM: "movie" | "tv";
  category: "social" | "critic";
  page?: number;
  pageSize?: number;
}): Promise<{ items: TReviewItem[]; hasMore: boolean }> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, params.pageSize ?? 10);
  const limit = page * pageSize;

  if (params.category === "social") {
    const socialReviews = await getSocialReviewsByType(params.id);
    return {
      items: socialReviews.slice(0, limit),
      hasMore: socialReviews.length > limit,
    };
  }

  const collected: TReviewItem[] = [];
  let hasMore = false;

  for (let currentPage = 1; currentPage <= page; currentPage += 1) {
    try {
      const data = await tmdbFetch<{ results: TReviewItem[]; total_pages: number }>(
        `/${params.typeM}/${params.id}/reviews`,
        { language: "en-US", page: currentPage },
        `getCategorizedReviewsByType(${params.id}, page ${currentPage})`
      );
      const results = Array.isArray(data?.results) ? data.results : [];
      const mapped = results.map((item: TReviewItem) => ({
        ...item,
        source: "tmdb" as const,
      }));

      collected.push(...mapped);

      const totalPages = Number(data?.total_pages ?? currentPage);
      hasMore = Number.isFinite(totalPages) ? currentPage < totalPages : false;

      if (results.length === 0) {
        hasMore = false;
        break;
      }
    } catch {
      hasMore = false;
      break;
    }
  }

  return {
    items: collected.slice(0, limit),
    hasMore,
  };
}

export async function getWatchProvidersByType(
  id: string,
  typeM: "movie" | "tv",
): Promise<TWatchProvidersData> {
  try {
    const data = await tmdbFetch<{ results: Record<string, unknown> }>(
      `/${typeM}/${id}/watch/providers`,
      {},
      `getWatchProvidersByType(${id}, ${typeM})`
    );

    const countryMap: Record<string, unknown> =
      data?.results && typeof data.results === "object"
        ? (data.results as Record<string, unknown>)
        : {};

    const usProviders = countryMap.US;
    const fallbackProviders = Object.values(countryMap).find(
      (value) => typeof value === "object" && value !== null,
    );

    const selected =
    (usProviders as Record<string, unknown> | undefined) ??
    (fallbackProviders as Record<string, unknown> | undefined) ??
    {};

  const normalizeProviders = (key: "flatrate" | "rent" | "buy") => {
    const raw = selected[key];
    if (!Array.isArray(raw)) return [] as TWatchProviderItem[];

    return raw
      .map((item: unknown) => {
        const provider = item as Record<string, unknown>;
        return {
          provider_id: Number(provider.provider_id ?? 0),
          provider_name: String(provider.provider_name ?? "Unknown Provider"),
          logo_path:
            typeof provider.logo_path === "string" ? provider.logo_path : null,
          display_priority: Number(provider.display_priority ?? 0),
        };
      })
      .filter((provider: TWatchProviderItem) => provider.provider_id > 0)
      .sort(
        (a: TWatchProviderItem, b: TWatchProviderItem) =>
          a.display_priority - b.display_priority,
      );
  };

  return {
    link: typeof selected.link === "string" ? selected.link : null,
    flatrate: normalizeProviders("flatrate"),
    rent: normalizeProviders("rent"),
    buy: normalizeProviders("buy"),
  };
}

export async function getImagesByType(
  id: string,
  typeM: "movie" | "tv",
): Promise<TImageItem[]> {
  try {
    const data = await tmdbFetch<{ backdrops: TImageItem[]; posters: TImageItem[] }>(
      `/${typeM}/${id}/images`,
      {},
      `getImagesByType(${id}, ${typeM})`
    );
    const backdrops = Array.isArray(data?.backdrops) ? data.backdrops : [];
    const posters = Array.isArray(data?.posters) ? data.posters : [];

    return [...backdrops, ...posters]
      .filter((item) => item?.file_path)
      .slice(0, 24);
  } catch (error) {
    throw error instanceof TMDBApiError ? error : new Error("Failed to fetch images");
  }
}

export async function getTVSeasonDetails(
  tvId: string,
  seasonNumber: number,
): Promise<TTvSeasonDetails> {
  try {
    const data = await tmdbFetch<any>(
      `/tv/${tvId}/season/${seasonNumber}`,
      { language: "en-US" },
      `getTVSeasonDetails(${tvId}, season ${seasonNumber})`
    );

    return {
      id: data.id,
      name: data.name,
      season_number: data.season_number,
      episodes: Array.isArray(data.episodes)
        ? data.episodes.map((episode: any) => ({
            id: episode.id,
            name: episode.name,
            episode_number: episode.episode_number,
            still_path: episode.still_path ?? null,
            air_date: episode.air_date ?? null,
            runtime: episode.runtime ?? null,
          }))
        : [],
    };
  } catch (error) {
    throw error instanceof TMDBApiError ? error : new Error("Failed to fetch TV season details");
  }
}

export async function getTVEpisodeDetails(
  tvId: string,
  seasonNumber: number,
  episodeNumber: number,
): Promise<TTvEpisodeDetails> {
  try {
    const data = await tmdbFetch<any>(
      `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,
      { language: "en-US" },
      `getTVEpisodeDetails(${tvId}, season ${seasonNumber}, episode ${episodeNumber})`
    );

    return {
      id: data.id,
      name: data.name,
      overview: data.overview ?? "",
      episode_number: data.episode_number ?? 0,
      season_number: data.season_number ?? seasonNumber,
      still_path: data.still_path ?? null,
      air_date: data.air_date ?? null,
      runtime: data.runtime ?? null,
      vote_average: data.vote_average ?? 0,
      vote_count: data.vote_count ?? 0,
      crew: Array.isArray(data.crew)
        ? data.crew.map((person: unknown) => {
            const p = person as Record<string, unknown>;
            return {
              id: Number(p.id ?? 0),
              name: String(p.name ?? "Unknown"),
              profile_path:
                typeof p.profile_path === "string" ? p.profile_path : null,
              job: typeof p.job === "string" ? p.job : undefined,
              department:
                typeof p.department === "string" ? p.department : undefined,
            };
          })
        : [],
      guest_stars: Array.isArray(data.guest_stars)
        ? data.guest_stars.map((person: unknown) => {
            const p = person as Record<string, unknown>;
            return {
              id: Number(p.id ?? 0),
              name: String(p.name ?? "Unknown"),
              profile_path:
                typeof p.profile_path === "string" ? p.profile_path : null,
              character:
                typeof p.character === "string" ? p.character : undefined,
            };
          })
        : [],
    };
  } catch (error) {
    throw error instanceof TMDBApiError ? error : new Error("Failed to fetch TV episode details");
  }
}

export async function getPersonDetails(id: string): Promise<TPersonDetails> {
  try {
    const data = await tmdbFetch<any>(
      `/person/${id}`,
      {},
      `getPersonDetails(${id})`
    );

    return {
      adult: Boolean(data?.adult),
      also_known_as: Array.isArray(data?.also_known_as) ? data.also_known_as : [],
      biography: data?.biography ?? "",
      birthday: data?.birthday ?? null,
      deathday: data?.deathday ?? null,
      gender: data?.gender ?? 0,
      homepage: data?.homepage ?? null,
      id: data?.id ?? 0,
      imdb_id: data?.imdb_id ?? null,
      known_for_department: data?.known_for_department ?? "Unknown",
      name: data?.name ?? "Unknown",
      place_of_birth: data?.place_of_birth ?? null,
      popularity: data?.popularity ?? 0,
      profile_path: data?.profile_path ?? null,
    };
  } catch (error) {
    throw error instanceof TMDBApiError ? error : new Error("Failed to fetch person details");
  }
}

export async function getPersonCombinedCredits(
  id: string,
): Promise<TPersonCombinedCredits> {
  try {
    const data = await tmdbFetch<any>(
      `/person/${id}/combined_credits`,
      {},
      `getPersonCombinedCredits(${id})`
    );

    const normalizeCreditItem = (item: Record<string, unknown>) => {
    const mediaType = item?.media_type === "tv" ? "tv" : "movie";

    return {
      id: Number(item?.id ?? 0),
      media_type: mediaType,
      genre_ids: Array.isArray(item?.genre_ids)
        ? item.genre_ids
            .map((genreId: unknown) => Number(genreId))
            .filter((genreId: number) => Number.isFinite(genreId))
        : [],
      poster_path:
        typeof item?.poster_path === "string" ? item.poster_path : null,
      backdrop_path:
        typeof item?.backdrop_path === "string" ? item.backdrop_path : null,
      title: typeof item?.title === "string" ? item.title : undefined,
      name: typeof item?.name === "string" ? item.name : undefined,
      release_date:
        typeof item?.release_date === "string" ? item.release_date : undefined,
      first_air_date:
        typeof item?.first_air_date === "string"
          ? item.first_air_date
          : undefined,
      character:
        typeof item?.character === "string" ? item.character : undefined,
      job: typeof item?.job === "string" ? item.job : undefined,
      vote_average: Number(item?.vote_average ?? 0),
      popularity: Number(item?.popularity ?? 0),
    } as TPersonCreditItem;
  };

  const cast = Array.isArray(data?.cast)
    ? data.cast
        .map((item: unknown) =>
          normalizeCreditItem(item as Record<string, unknown>),
        )
        .filter((item: TPersonCreditItem) => item.id > 0)
    : [];

  const crew = Array.isArray(data?.crew)
    ? data.crew
        .map((item: unknown) =>
          normalizeCreditItem(item as Record<string, unknown>),
        )
        .filter((item: TPersonCreditItem) => item.id > 0)
    : [];

  return { cast, crew };
}

export async function getPersonImages(id: string): Promise<TPersonImageItem[]> {
  try {
    const data = await tmdbFetch<{ profiles: TPersonImageItem[] }>(
      `/person/${id}/images`,
      {},
      `getPersonImages(${id})`
    );
    const profiles: Array<Record<string, unknown>> = Array.isArray(data?.profiles)
      ? data.profiles
      : [];

    return profiles
      .filter((item: Record<string, unknown>) => item?.file_path)
    .map((item: Record<string, unknown>) => ({
      file_path: String(item.file_path),
      width: Number(item.width ?? 0),
      height: Number(item.height ?? 0),
      vote_average: Number(item.vote_average ?? 0),
    }))
    .slice(0, 12);
}

export type ExploreMovieListItem = {
  id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  title: string;
  release_date: string;
  vote_average: number;
};

export type ExploreTvListItem = {
  id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  name: string;
  first_air_date: string;
  vote_average: number;
};

export type ExploreTrendingItem = {
  id: number;
  media_type: "movie" | "tv" | "person";
  poster_path: string | null;
  backdrop_path: string | null;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
};

export type ExploreMediaDetails = {
  genres: { id: number; name: string }[];
  runtime?: number | null;
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
};

type ExploreListResponse<T> = {
  results: T[];
};

async function getExploreList<T>(endpoint: string): Promise<T[]> {
  try {
    const hasQuery = endpoint.includes("?");
    const params: Record<string, any> = { language: "en-US", page: 1 };
    
    // If endpoint has query params, parse them
    if (hasQuery) {
      const [path, queryString] = endpoint.split("?");
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      endpoint = path;
    }

    const data = await tmdbFetch<{ results: T[] }>(
      `/${endpoint}`,
      params,
      `getExploreList(${endpoint})`
    );

    return data.results ?? [];
  } catch (error) {
    throw error instanceof TMDBApiError ? error : new Error("Failed to fetch explore list");
  }
}

export async function getExploreTrendingList(): Promise<ExploreTrendingItem[]> {
  return getExploreList<ExploreTrendingItem>("trending/all/week");
}

export async function getExploreNowPlayingMovies(): Promise<
  ExploreMovieListItem[]
> {
  return getExploreList<ExploreMovieListItem>("movie/now_playing");
}

export async function getExploreTopRatedMovies(): Promise<
  ExploreMovieListItem[]
> {
  return getExploreList<ExploreMovieListItem>("movie/top_rated");
}

export async function getExplorePopularTvShows(): Promise<ExploreTvListItem[]> {
  return getExploreList<ExploreTvListItem>("tv/popular");
}

export async function getExploreOnTheAirTvShows(): Promise<
  ExploreTvListItem[]
> {
  return getExploreList<ExploreTvListItem>("tv/on_the_air");
}

export async function getExploreGenreMovies(
  withGenres: string,
): Promise<ExploreMovieListItem[]> {
  return getExploreList<ExploreMovieListItem>(
    `discover/movie?include_adult=false&include_video=false&sort_by=vote_average.desc&vote_count.gte=1200&with_genres=${withGenres}`,
  );
}

export async function getExploreMediaDetails(
  mediaType: "movie" | "tv",
  id: number,
): Promise<ExploreMediaDetails | null> {
  try {
    return await tmdbFetch<ExploreMediaDetails>(
      `/${mediaType}/${id}`,
      { language: "en-US" },
      `getExploreMediaDetails(${mediaType}, ${id})`
    );
  } catch (error) {
    return null;
  }
}

export async function getExploreMovieDetails(
  id: number,
): Promise<ExploreMediaDetails | null> {
  return getExploreMediaDetails("movie", id);
}
type Props = {
  rating: number;
  date: string;
  review: string;
  watchType: "first" | "rewatch";
  showId: string | number; // Assuming showId can be a string or number
};

export type TExistingLog = {
  id: string;
  rating: number;
  review: string;
  watchedAt: string;
  watchType: "first" | "rewatch";
};

function isMissingWatchTypeColumn(error: unknown): boolean {
  const dbError = error as { code?: string; message?: string };
  if (dbError?.code !== "42703") return false;

  const message = dbError?.message ?? "";
  return message.includes("watchType") || message.includes("watchtype");
}

function isSchemaDriftError(error: unknown): boolean {
  const dbError = error as { code?: string; message?: string };
  if (!dbError?.code) return false;

  // 42703: undefined_column, 42P01: undefined_table
  return dbError.code === "42703" || dbError.code === "42P01";
}

function isMissingUserProfileColumns(error: unknown): boolean {
  const dbError = error as { code?: string; message?: string };
  if (dbError?.code !== "42703") return false;

  const message = (dbError?.message ?? "").toLowerCase();
  return (
    message.includes("bio") ||
    message.includes("premium") ||
    message.includes("backdrop_path") ||
    message.includes("backdroppath")
  );
}

export async function getLoggedMovieTv(
  showId: string | number,
): Promise<TExistingLog | null> {
  const user = await getUser();

  if (!user?.id) return null;

  const normalizedShowId = String(showId);

  let existingLog:
    | Array<{
        id: string;
        rating: number | null;
        review: string | null;
        watchedAt: Date;
        watchType: string | null;
        reviewTitle: string | null;
      }>
    | Array<{
        id: string;
        rating: number | null;
        review: string | null;
        watchedAt: Date;
        reviewTitle: string | null;
      }>;

  try {
    existingLog = await db
      .select({
        id: loggedMovies.id,
        rating: loggedMovies.rating,
        review: loggedMovies.review,
        watchedAt: loggedMovies.watchedAt,
        watchType: loggedMovies.watchType,
        reviewTitle: loggedMovies.reviewTitle,
      })
      .from(loggedMovies)
      .where(
        and(
          eq(loggedMovies.userId, user.id as string),
          eq(loggedMovies.showId, normalizedShowId),
        ),
      )
      .orderBy(desc(loggedMovies.createdAt))
      .limit(1);
  } catch (error) {
    if (!isMissingWatchTypeColumn(error)) throw error;

    existingLog = await db
      .select({
        id: loggedMovies.id,
        rating: loggedMovies.rating,
        review: loggedMovies.review,
        watchedAt: loggedMovies.watchedAt,
        reviewTitle: loggedMovies.reviewTitle,
      })
      .from(loggedMovies)
      .where(
        and(
          eq(loggedMovies.userId, user.id as string),
          eq(loggedMovies.showId, normalizedShowId),
        ),
      )
      .orderBy(desc(loggedMovies.createdAt))
      .limit(1);
  }

  const row = existingLog[0];
  if (!row) return null;

  const parsedHalfRating = Number.parseFloat(row.reviewTitle ?? "");
  const normalizedRating = Number.isFinite(parsedHalfRating)
    ? parsedHalfRating
    : Number(row.rating ?? 0);

  return {
    id: row.id,
    rating: normalizedRating,
    review: row.review ?? "",
    watchedAt: row.watchedAt.toISOString(),
    watchType:
      "watchType" in row && row.watchType === "rewatch" ? "rewatch" : "first",
  };
}

export async function sendLoggedMovieTv({
  rating,
  date,
  review,
  watchType,
  showId,
}: Props) {
  const user = await getUser();

  if (!user?.id) throw new Error("User not authenticated");

  const normalizedShowId = String(showId);
  const normalizedRating = Math.max(0, Math.min(5, rating));

  const existingLog = await db
    .select({ id: loggedMovies.id })
    .from(loggedMovies)
    .where(
      and(
        eq(loggedMovies.userId, user.id as string),
        eq(loggedMovies.showId, normalizedShowId),
      ),
    )
    .orderBy(desc(loggedMovies.createdAt))
    .limit(1);

  if (existingLog.length > 0) {
    try {
      await db
        .update(loggedMovies)
        .set({
          rating: normalizedRating,
          reviewTitle: String(normalizedRating),
          watchedAt: new Date(date),
          review,
          watchType,
        })
        .where(eq(loggedMovies.id, existingLog[0].id));
    } catch (error) {
      if (!isMissingWatchTypeColumn(error)) throw error;

      await db
        .update(loggedMovies)
        .set({
          rating: normalizedRating,
          reviewTitle: String(normalizedRating),
          watchedAt: new Date(date),
          review,
        })
        .where(eq(loggedMovies.id, existingLog[0].id));
    }

    const userBookmarks = await getBookmarks(user.id);
    const watchlistIds = userBookmarks
      .filter((bookmark) =>
        ["watchlist", "watch later", "to watch", "queue"].some((key) =>
          bookmark.bookmarkName.toLowerCase().includes(key),
        ),
      )
      .map((bookmark) => bookmark.id);

    if (watchlistIds.length > 0) {
      await db
        .delete(bookmarksMovies)
        .where(
          and(
            inArray(bookmarksMovies.bookmarkId, watchlistIds),
            eq(bookmarksMovies.movieId, normalizedShowId),
          ),
        );
    }

    return { already: true as const, updated: true as const };
  }

  try {
    await db.insert(loggedMovies).values({
      rating: normalizedRating,
      reviewTitle: String(normalizedRating),
      watchedAt: new Date(date),
      review,
      watchType,
      userId: user.id as string,
      showId: normalizedShowId,
    });
  } catch (error) {
    if (!isMissingWatchTypeColumn(error)) throw error;

    await db.insert(loggedMovies).values({
      rating: normalizedRating,
      reviewTitle: String(normalizedRating),
      watchedAt: new Date(date),
      review,
      userId: user.id as string,
      showId: normalizedShowId,
    });
  }

  const userBookmarks = await getBookmarks(user.id);
  const watchlistIds = userBookmarks
    .filter((bookmark) =>
      ["watchlist", "watch later", "to watch", "queue"].some((key) =>
        bookmark.bookmarkName.toLowerCase().includes(key),
      ),
    )
    .map((bookmark) => bookmark.id);

  if (watchlistIds.length > 0) {
    await db
      .delete(bookmarksMovies)
      .where(
        and(
          inArray(bookmarksMovies.bookmarkId, watchlistIds),
          eq(bookmarksMovies.movieId, normalizedShowId),
        ),
      );
  }

  return { already: false as const, updated: false as const };
}

//---------------------------
// NOTIFICATIONS
//---------------------------

export async function getUserNotifications(
  limit: number = 20,
  offset: number = 0,
) {
  const user = await getUser();
  if (!user?.id) return [];

  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      message: notifications.message,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
      sourceUserId: notifications.sourceUserId,
      sourceUserName: users.name,
      sourceUserImage: users.image,
      sourceUserUsername: users.username,
      referenceId: notifications.referenceId,
    })
    .from(notifications)
    .leftJoin(users, eq(users.id, notifications.sourceUserId))
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  return rows;
}

export async function getUnreadNotificationCount() {
  const user = await getUser();
  if (!user?.id) return 0;

  const result = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, user.id), eq(notifications.isRead, false)),
    );

  return result[0]?.count ?? 0;
}

export async function markNotificationAsRead(notificationId: string) {
  const user = await getUser();
  if (!user?.id) return { success: false };

  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, user.id),
        ),
      );
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function markAllNotificationsAsRead() {
  const user = await getUser();
  if (!user?.id) return { success: false };

  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, user.id));
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function createNotification(data: {
  userId: string;
  type: string;
  sourceUserId?: string;
  referenceId?: string;
  message?: string;
}) {
  try {
    const result = await db.insert(notifications).values({
      userId: data.userId,
      type: data.type,
      sourceUserId: data.sourceUserId,
      referenceId: data.referenceId,
      message: data.message,
      isRead: false,
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

//---------------------------
// USER STATISTICS
//---------------------------

export async function getUserStatistics(username: string) {
  const targetUser = await getUserDbProfileByUsername(username);
  if (!targetUser?.id) return null;

  const userMovies = await db
    .select({
      showId: loggedMovies.showId,
      rating: loggedMovies.rating,
    })
    .from(loggedMovies)
    .where(eq(loggedMovies.userId, targetUser.id));

  const totalMovies = userMovies.length;
  const totalRatings = userMovies.filter((m) => m.rating !== null).length;

  let averageRating = 0;
  if (totalRatings > 0) {
    const sumRatings = userMovies.reduce((sum, m) => sum + (m.rating ?? 0), 0);
    averageRating = sumRatings / totalRatings;
  }

  const enrichedEntries = await Promise.all(
    userMovies.slice(0, 120).map(async (entry) => {
      const decoded = decodeStoredMediaId(entry.showId);
      const resolvedId = decoded.id;
      if (!resolvedId) return null;

      const readMovie = async () => {
        const movie = await getSpecifiedMovie(resolvedId);
        const genres = Array.isArray((movie as any)?.genres)
          ? (movie as any).genres
          : [];
        return {
          runtime: Number((movie as any)?.runtime ?? 0),
          genres: genres
            .map((genre: any) => String(genre?.name ?? "").trim())
            .filter(Boolean),
        };
      };

      const readTv = async () => {
        const tv = await getSpecifiedTV(resolvedId);
        const genres = Array.isArray((tv as any)?.genres)
          ? (tv as any).genres
          : [];
        const fallbackRuntime = Array.isArray((tv as any)?.episode_run_time)
          ? Number((tv as any).episode_run_time[0] ?? 0)
          : 0;

        return {
          runtime: Number((tv as any)?.runtime ?? fallbackRuntime ?? 0),
          genres: genres
            .map((genre: any) => String(genre?.name ?? "").trim())
            .filter(Boolean),
        };
      };

      try {
        if (decoded.mediaType === "movie") return await readMovie();
        if (decoded.mediaType === "tv") return await readTv();

        try {
          return await readMovie();
        } catch {
          return await readTv();
        }
      } catch {
        return null;
      }
    }),
  );

  const totalMinutesWatched = enrichedEntries.reduce(
    (sum, item) => sum + Number(item?.runtime ?? 0),
    0,
  );

  const genreCounts = new Map<string, number>();
  enrichedEntries.forEach((item) => {
    item?.genres.forEach((genre: string) => {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    });
  });

  const topGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  return {
    totalMoviesWatched: totalMovies,
    averageRating: averageRating.toFixed(2),
    totalHoursWatched: Number((totalMinutesWatched / 60).toFixed(1)),
    topGenres,
  };
}

//---------------------------
// COLLABORATIVE LISTS
//---------------------------

export async function inviteCollaborator(
  bookmarkId: string,
  invitedUserId: string,
) {
  const user = await getUser();
  if (!user?.id) return { success: false, error: "Not authenticated" };

  try {
    await cleanupSystemListCollaborations();

    // Check if user is bookmark owner
    const bookmark = await db
      .select({
        userId: bookmarks.userId,
        bookmarkName: bookmarks.bookmarkName,
      })
      .from(bookmarks)
      .where(eq(bookmarks.id, bookmarkId))
      .limit(1);

    if (!bookmark[0] || bookmark[0].userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (isSystemListName(bookmark[0].bookmarkName)) {
      return {
        success: false,
        error: "Profile system lists cannot have collaborators",
      };
    }

    // Friend-only rule: both users must follow each other.
    const [ownerFollowsInvited, invitedFollowsOwner] = await Promise.all([
      db
        .select({ followerId: userFollows.followerId })
        .from(userFollows)
        .where(
          and(
            eq(userFollows.followerId, user.id),
            eq(userFollows.followingId, invitedUserId),
          ),
        )
        .limit(1),
      db
        .select({ followerId: userFollows.followerId })
        .from(userFollows)
        .where(
          and(
            eq(userFollows.followerId, invitedUserId),
            eq(userFollows.followingId, user.id),
          ),
        )
        .limit(1),
    ]);

    if (!ownerFollowsInvited[0] || !invitedFollowsOwner[0]) {
      return {
        success: false,
        error: "You can invite only friends (mutual follows)",
      };
    }

    // Check if already a collaborator
    const existing = await db
      .select({ id: listCollaborators.id })
      .from(listCollaborators)
      .where(
        and(
          eq(listCollaborators.bookmarkId, bookmarkId),
          eq(listCollaborators.userId, invitedUserId),
        ),
      )
      .limit(1);

    if (existing[0]) {
      return { success: false, error: "Already a collaborator" };
    }

    // Create collaborator record with pending status
    await db.insert(listCollaborators).values({
      bookmarkId,
      userId: invitedUserId,
      status: "pending",
      addedBy: user.id,
    });

    // Create notification for invited user
    await createNotification({
      userId: invitedUserId,
      type: "collab_invite",
      sourceUserId: user.id,
      referenceId: bookmarkId,
      message: `${user.name ?? "Someone"} invited you to collaborate on a list`,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function acceptCollaborationInvite(bookmarkId: string) {
  const user = await getUser();
  if (!user?.id) return { success: false, error: "Not authenticated" };

  try {
    const collaborator = await db
      .select({ id: listCollaborators.id, status: listCollaborators.status })
      .from(listCollaborators)
      .where(
        and(
          eq(listCollaborators.bookmarkId, bookmarkId),
          eq(listCollaborators.userId, user.id),
        ),
      )
      .limit(1);

    if (!collaborator[0]) {
      return { success: false, error: "Invitation not found" };
    }

    const bookmarkRow = await db
      .select({ bookmarkName: bookmarks.bookmarkName })
      .from(bookmarks)
      .where(eq(bookmarks.id, bookmarkId))
      .limit(1);

    if (bookmarkRow[0] && isSystemListName(bookmarkRow[0].bookmarkName)) {
      await db
        .delete(listCollaborators)
        .where(
          and(
            eq(listCollaborators.bookmarkId, bookmarkId),
            eq(listCollaborators.userId, user.id),
          ),
        );
      return { success: true, removedInvalid: true };
    }

    if (collaborator[0].status === "accepted") {
      return { success: true, alreadyAccepted: true };
    }

    await db
      .update(listCollaborators)
      .set({ status: "accepted" })
      .where(eq(listCollaborators.id, collaborator[0].id));

    // Notify list owner
    const bookmark = await db
      .select({ userId: bookmarks.userId })
      .from(bookmarks)
      .where(eq(bookmarks.id, bookmarkId))
      .limit(1);

    if (bookmark[0]) {
      await createNotification({
        userId: bookmark[0].userId,
        type: "collab_accept",
        sourceUserId: user.id,
        referenceId: bookmarkId,
        message: `${user.name ?? "Someone"} accepted your collaboration invite`,
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function declineCollaborationInvite(bookmarkId: string) {
  const user = await getUser();
  if (!user?.id) return { success: false, error: "Not authenticated" };

  try {
    await db
      .delete(listCollaborators)
      .where(
        and(
          eq(listCollaborators.bookmarkId, bookmarkId),
          eq(listCollaborators.userId, user.id),
          eq(listCollaborators.status, "pending"),
        ),
      );

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function getListCollaborators(bookmarkId: string) {
  try {
    const bookmark = await db
      .select({ bookmarkName: bookmarks.bookmarkName })
      .from(bookmarks)
      .where(eq(bookmarks.id, bookmarkId))
      .limit(1);

    if (bookmark[0] && isSystemListName(bookmark[0].bookmarkName)) {
      return [];
    }

    const collaborators = await db
      .select({
        id: listCollaborators.id,
        userId: listCollaborators.userId,
        status: listCollaborators.status,
        userName: users.name,
        userImage: users.image,
        userUsername: users.username,
      })
      .from(listCollaborators)
      .leftJoin(users, eq(users.id, listCollaborators.userId))
      .where(eq(listCollaborators.bookmarkId, bookmarkId));

    return collaborators;
  } catch {
    return [];
  }
}

export async function canUserEditBookmark(bookmarkId: string) {
  const user = await getUser();
  if (!user?.id) return false;

  // Owner can always edit
  const bookmark = await db
    .select({ userId: bookmarks.userId, bookmarkName: bookmarks.bookmarkName })
    .from(bookmarks)
    .where(eq(bookmarks.id, bookmarkId))
    .limit(1);

  if (bookmark[0]?.userId === user.id) return true;
  if (bookmark[0] && isSystemListName(bookmark[0].bookmarkName)) return false;

  const collaborator = await db
    .select({ id: listCollaborators.id })
    .from(listCollaborators)
    .where(
      and(
        eq(listCollaborators.bookmarkId, bookmarkId),
        eq(listCollaborators.userId, user.id),
        eq(listCollaborators.status, "accepted"),
      ),
    )
    .limit(1);

  return Boolean(collaborator[0]);
}

export async function canUserModifyListMetadata(bookmarkId: string) {
  const user = await getUser();
  if (!user?.id) return false;

  // Only owner can modify name/description
  const bookmark = await db
    .select({ userId: bookmarks.userId })
    .from(bookmarks)
    .where(eq(bookmarks.id, bookmarkId))
    .limit(1);

  return bookmark[0]?.userId === user.id;
}

export async function removeCollaborator(
  bookmarkId: string,
  collaboratorUserId: string,
) {
  const user = await getUser();
  if (!user?.id) return { success: false, error: "Not authenticated" };

  try {
    // Only owner can remove collaborators
    const bookmark = await db
      .select({ userId: bookmarks.userId })
      .from(bookmarks)
      .where(eq(bookmarks.id, bookmarkId))
      .limit(1);

    if (!bookmark[0] || bookmark[0].userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .delete(listCollaborators)
      .where(
        and(
          eq(listCollaborators.bookmarkId, bookmarkId),
          eq(listCollaborators.userId, collaboratorUserId),
        ),
      );

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function getIsFollowingUser(targetUserId: string) {
  const user = await getUser();
  if (!user?.id) return false;

  const follow = await db
    .select({ id: userFollows.followerId })
    .from(userFollows)
    .where(
      and(
        eq(userFollows.followerId, user.id),
        eq(userFollows.followingId, targetUserId),
      ),
    )
    .limit(1);

  return !!follow[0];
}

export async function getMutualFriends(targetUserId: string) {
  const user = await getUser();
  if (!user?.id) return [];

  // Get users that both follow
  const result = await db
    .select({ userId: userFollows.followingId })
    .from(userFollows)
    .where(eq(userFollows.followerId, user.id));

  const userFollowingIds = new Set(result.map((r) => r.userId));

  const targetFollowing = await db
    .select({ userId: userFollows.followingId })
    .from(userFollows)
    .where(eq(userFollows.followerId, targetUserId));

  const mutualIds = targetFollowing
    .map((r) => r.userId)
    .filter((id) => userFollowingIds.has(id));

  return mutualIds;
}

export async function getFriendsForCurrentUser() {
  const user = await getUser();
  if (!user?.id) return [];

  const followingRows = await db
    .select({ userId: userFollows.followingId })
    .from(userFollows)
    .where(eq(userFollows.followerId, user.id));

  const followersRows = await db
    .select({ userId: userFollows.followerId })
    .from(userFollows)
    .where(eq(userFollows.followingId, user.id));

  const followingSet = new Set(followingRows.map((row) => row.userId));
  const friendIds = followersRows
    .map((row) => row.userId)
    .filter((id) => followingSet.has(id));

  if (friendIds.length === 0) return [];

  const friendProfiles = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      image: users.image,
    })
    .from(users)
    .where(inArray(users.id, friendIds));

  return friendProfiles;
}

export async function getCollaborativeBookmarksForCurrentUser() {
  const user = await getUser();
  if (!user?.id) return [];

  await cleanupSystemListCollaborations();

  const rows = await db
    .select({
      id: bookmarks.id,
      userId: bookmarks.userId,
      bookmarkName: bookmarks.bookmarkName,
      description: bookmarks.description,
      image: bookmarks.image,
      createdAt: bookmarks.createdAt,
      updatedAt: bookmarks.updatedAt,
    })
    .from(listCollaborators)
    .innerJoin(bookmarks, eq(bookmarks.id, listCollaborators.bookmarkId))
    .where(
      and(
        eq(listCollaborators.userId, user.id),
        eq(listCollaborators.status, "accepted"),
      ),
    );

  return rows.filter((row) => !isSystemListName(row.bookmarkName));
}

export async function getLikedBookmarksForCurrentUser() {
  const user = await getUser();
  if (!user?.id) return [];

  const rows = await db
    .select({
      id: bookmarks.id,
      userId: bookmarks.userId,
      bookmarkName: bookmarks.bookmarkName,
      description: bookmarks.description,
      image: bookmarks.image,
      createdAt: bookmarks.createdAt,
      updatedAt: bookmarks.updatedAt,
    })
    .from(listLikes)
    .innerJoin(bookmarks, eq(bookmarks.id, listLikes.bookmarkId))
    .where(and(eq(listLikes.userId, user.id), ne(bookmarks.userId, user.id)));

  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return !isSystemListName(row.bookmarkName);
  });
}

export async function getCollaboratorsForBookmarks(bookmarkIds: string[]) {
  if (bookmarkIds.length === 0) return [];

  const rows = await db
    .select({
      bookmarkId: listCollaborators.bookmarkId,
      userId: users.id,
      name: users.name,
      username: users.username,
      image: users.image,
      status: listCollaborators.status,
    })
    .from(listCollaborators)
    .innerJoin(users, eq(users.id, listCollaborators.userId))
    .where(inArray(listCollaborators.bookmarkId, bookmarkIds));

  return rows;
}

export async function getBasicUsersByIds(userIds: string[]) {
  if (userIds.length === 0) return [];

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      image: users.image,
    })
    .from(users)
    .where(inArray(users.id, userIds));

  return rows;
}
