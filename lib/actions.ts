"use server";

import { auth, signIn } from "@/auth";
import { bookmarks, bookmarksMovies } from "@/db/schema";
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

//------------------------------------------------------------------------#uilities for handlingath

export async function getUser() {
  const session = await auth();
  const user = session?.user;

  return user;
}

export async function getSession() {
  const session = await auth();
  return session;
}

// auth utilites
export async function handleLogout() {
  await signOut();
}

type provider = "github" | "google";
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
  const validatedBoks = boks.map((bookmark) => bookmarksSchema.parse(bookmark));

  return validatedBoks;
}

//   fetch only movies of specied bookmark of that specified user

type moviesBookSchemaType = z.infer<typeof bookmarksMoviesSchema>;

export async function getMoviesBook(
  bookmarkId: string,
): Promise<moviesBookSchemaType[]> {
  try {
    // Fetch the movies with the given bookmarkId from the database
    const bookmarkMovies = await db
      .select()
      .from(bookmarksMovies)
      .where(eq(bookmarksMovies.bookmarkId, bookmarkId));

    // Validate the fetched data against the schema
    const validatedMovies = bookmarkMovies.map((movie) =>
      bookmarksMoviesSchema.parse(movie),
    );

    return validatedMovies;
  } catch (error: any) {
    console.error("Error fetching or validating bookmarks:", error.message);

    // Handle the error (could be logging, rethrowing, or custom handling)
    throw new Error("Failed to fetch or validate bookmark movies.");
  }
}

//TODO VALIDATE THE DATA COMING FROM THE FORM
export async function AddMovie(formData: FormData) {
  console.log(formData.get("bookmarkId") as string);
  console.log(formData.get("review") as string);
  console.log(formData.get("movieId") as string);
  await db.insert(bookmarksMovies).values({
    bookmarkId: formData.get("bookmarkId") as string,
    review: formData.get("review") as string,
    movieId: formData.get("movieId") as string,
  });
}

export async function CreateBookmark(formData: FormData) {
  console.log(formData.get("bookmarkName") as string);
  console.log(formData.get("description") as string);
  console.log(formData.get("id") as string);
  const insert = await db.insert(bookmarks).values({
    bookmarkName: formData.get("bookmarkName") as string,
    userId: formData.get("id") as string,
    description: formData.get("description") as string,
  });
  console.log(insert);
  return insert;
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
