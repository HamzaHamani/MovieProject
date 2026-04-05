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
} from "@/db/schema";
import { db } from "@/db";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
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

//------------------------------------------------------------------------#uilities for handlingath
cache;

// USED CACHE TO PERFORM APP, CHECK WEB CODY DEV VIDEO https://youtu.be/8vJ3JC9O2Eo

export const getUser = cache(async () => {
  const session = await auth();
  const user = session?.user;

  return user;
});

export async function getCurrentUserDbProfile() {
  const user = await getUser();

  if (!user?.id) return null;

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      premium: users.premium,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  return rows[0] ?? null;
}

export async function getUserDbProfileByUsername(usernameInput: string) {
  const username = normalizeUsername(usernameInput);

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      premium: users.premium,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return rows[0] ?? null;
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
  await signIn(provider);
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

function normalizeListName(input: string) {
  return input.trim().toLowerCase();
}

function matchesAnyListKeyword(value: string, keywords: string[]) {
  const normalized = normalizeListName(value);
  return keywords.some((keyword) => normalized.includes(keyword));
}

function isSystemListName(name: string) {
  return (
    matchesAnyListKeyword(name, SYSTEM_LIKES_KEYWORDS) ||
    matchesAnyListKeyword(name, SYSTEM_WATCHLIST_KEYWORDS)
  );
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

  await db
    .insert(userFollows)
    .values({ followerId: user.id, followingId: targetUser.id })
    .onConflictDoNothing();

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

  return { ok: true as const, reply: inserted[0] };
}

export async function getReviewEngagement(reviewId: string) {
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
  if (bookmark.userId !== user.id) throw new Error("Not allowed");

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
  await ensureDefaultSystemListsForUser(userId);

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
}) {
  if (!data.review) data.review = "";

  // handling movie if already on watchList or not
  const existingMovie = await getMoviesBook(data.bookmarkId);
  const existingMovieResponse = existingMovie.some(
    (movie) => movie.movieId == data.movieId,
  );

  if (existingMovieResponse) return { already: true };
  if (!existingMovieResponse) {
    await db.insert(bookmarksMovies).values({
      bookmarkId: data.bookmarkId as string,
      review: data.review,
      movieId: data.movieId as string,
    });
    return { already: false };
  }
}

export async function RemoveMovie(data: {
  bookmarkId: string;
  movieId: string | number;
}) {
  const existingMovie = await getMoviesBook(data.bookmarkId);
  const match = existingMovie.find((movie) => movie.movieId == data.movieId);

  if (!match) return { removed: false as const };

  await db.delete(bookmarksMovies).where(eq(bookmarksMovies.id, match.id));

  return { removed: true as const };
}

export async function addMovieToProfileSection(data: {
  section: "favorites" | "likes" | "watchlist";
  movieId: string | number;
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
  const res = await axios.get(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

  return data;
}

// utilite for specified tv show
export async function getSpecifiedTV(id: string): Promise<TspecifiedTv> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

  return data;
}

//---general utilites for fetching data from the api

export async function getSpecifiedTVMovieVideos(
  id: string,
  typeM: "movie" | "tv",
): Promise<TvideoApiSchema> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/${typeM}/${id}/videos?language=en-US&api_key=${process.env.TMDB_API_KEY}`,
  );
  const data: TvideoApiSchema = await res.data;
  return data;
}

export async function getCreditsTVMovie(
  id: string,
  typeM: "movie" | "tv",
): Promise<TCreditsSchema> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/${typeM}/${id}/credits?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;
  return data;
}

// utilite for search page

type values = {
  query: string;
  page: number;
};
export async function getSearchMovie(values: values): Promise<TsearchMovie> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/search/multi?query=${values.query}&include_adult=true&language=en-US&page=${values.page}&api_key=${process.env.TMDB_API_KEY}&include_adult=true`,
  );
  const data: TsearchMovie = await res.data;
  return data;
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
  content: string;
  created_at: string;
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
    const res = await axios.get(
      `https://api.themoviedb.org/3/${typeM}/${id}/similar?language=en-US&page=1&api_key=${process.env.TMDB_API_KEY}`,
    );
    const data = await res.data;
    return data?.results ?? [];
  } catch {
    return [];
  }
}

export async function getReviewsByType(
  id: string,
  typeM: "movie" | "tv",
): Promise<TReviewItem[]> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/${typeM}/${id}/reviews?language=en-US&page=1&api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;
  return data?.results ?? [];
}

export async function getWatchProvidersByType(
  id: string,
  typeM: "movie" | "tv",
): Promise<TWatchProvidersData> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/${typeM}/${id}/watch/providers?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

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
  const res = await axios.get(
    `https://api.themoviedb.org/3/${typeM}/${id}/images?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;
  const backdrops = Array.isArray(data?.backdrops) ? data.backdrops : [];
  const posters = Array.isArray(data?.posters) ? data.posters : [];

  return [...backdrops, ...posters]
    .filter((item) => item?.file_path)
    .slice(0, 24);
}

export async function getTVSeasonDetails(
  tvId: string,
  seasonNumber: number,
): Promise<TTvSeasonDetails> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?language=en-US&api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

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
}

export async function getTVEpisodeDetails(
  tvId: string,
  seasonNumber: number,
  episodeNumber: number,
): Promise<TTvEpisodeDetails> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}?language=en-US&api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

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
}

export async function getPersonDetails(id: string): Promise<TPersonDetails> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/person/${id}?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

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
}

export async function getPersonCombinedCredits(
  id: string,
): Promise<TPersonCombinedCredits> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

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
  const res = await axios.get(
    `https://api.themoviedb.org/3/person/${id}/images?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;
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
  const hasQuery = endpoint.includes("?");
  const connector = hasQuery ? "&" : "?";
  const res = await axios.get(
    `https://api.themoviedb.org/3/${endpoint}${connector}language=en-US&page=1&api_key=${process.env.TMDB_API_KEY}`,
  );

  const data: ExploreListResponse<T> = await res.data;
  return data.results ?? [];
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
    const res = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${id}?language=en-US&api_key=${process.env.TMDB_API_KEY}`,
    );
    const data: ExploreMediaDetails = await res.data;
    return data;
  } catch {
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
