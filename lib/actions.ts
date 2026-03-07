"use server";

import { auth, signIn } from "@/auth";
import { bookmarks, bookmarksMovies, loggedMovies } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
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
//------------------------------------------------------------------------#uilities for fetching data from the database

//   fetching only the bookmarks of the user

type bookSchemaType = z.infer<typeof bookmarksSchema>;
export async function getBookmarks(userId: string): Promise<bookSchemaType[]> {
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

export async function getSimilarByType(
  id: string,
  typeM: "movie" | "tv",
): Promise<TSimilarItem[]> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/${typeM}/${id}/similar?language=en-US&page=1&api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;
  return data?.results ?? [];
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
  reviewTitle: string;
  rating: number;
  date: string;
  review: string;
  showId: string | number; // Assuming showId can be a string or number
};

export async function sendLoggedMovieTv({
  reviewTitle,
  rating,
  date,
  review,
  showId,
}: Props) {
  const user = await getUser();

  if (!user) throw new Error("User not authenticated");

  const logData = {
    reviewTitle,
    rating,
    date,
    review,
    userId: user.id,
    showId,
  };

  console.log(logData);

  // await db.insert(loggedMovies).values(logData).onConflictDoNothing();
  await db
    .insert(loggedMovies)
    .values({
      reviewTitle,
      rating,
      watchedAt: new Date(date),
      review,
      userId: user.id as string,
      showId: showId as string,
    })
    .onConflictDoNothing();

  // Here you would typically send this data to your backend or database
  console.log("Log Data:", logData);
  return logData; // Return the log data for further processing if needed
}
