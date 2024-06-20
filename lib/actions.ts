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

export async function getUser() {
  const session = await auth();
  const user = session?.user;

  return user;
}

export async function getSession() {
  const session = await auth();
  return session;
}

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
  bookmarkId: string
): Promise<moviesBookSchemaType[]> {
  const bookmarkMovie = await db
    .select()
    .from(bookmarksMovies)
    .where(eq(bookmarksMovies.bookmarkId, bookmarkId));

  const validateMovieBooks = bookmarkMovie.map((movie) =>
    bookmarksMoviesSchema.parse(movie)
  );
  return validateMovieBooks;
}

//TODO VALIDATE THE DATA COMING FROM THE FORM
export async function AddMovie(formData: FormData) {
  await db.insert(bookmarksMovies).values({
    bookmarkId: formData.get("bookmarkId") as string,
    review: formData.get("review") as string,
    movieId: formData.get("movieId") as string,
  });
}

export async function CreateBookmark(formData: FormData) {
  const insert = await db.insert(bookmarks).values({
    bookmarkName: formData.get("bookmarkName") as string,
    userId: formData.get("id") as string,
    description: formData.get("description") as string,
  });
  console.log(insert);
  return insert;
}
export async function handleLogout() {
  await signOut();
}

type provider = "github" | "google";
export async function handleSignin(provider: provider) {
  await signIn(provider);
}
