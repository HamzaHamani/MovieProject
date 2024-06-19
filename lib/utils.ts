import { auth } from "@/auth";
import { db } from "@/db";
import { bookmarks, bookmarksMovies } from "@/db/schema";
import { type ClassValue, clsx } from "clsx";
import { eq } from "drizzle-orm";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// const api_key = process.env.TMDB_API_KEY!;
// console.log(api_key);

// const res = fetch(
//   `https://api.themoviedb.org/3/movie/157336?language=en-US&api_key=${api_key}`
// );

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
export async function fetchBookmarks(userId: string) {
  const boks = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));
  return console.log(boks);
}

//   fetch only movies of specied bookmark of that specified user
export async function fetchMoviesBook(bookmarkId: string) {
  const bookmarkMovie = await db
    .select()
    .from(bookmarksMovies)
    .where(eq(bookmarksMovies.bookmarkId, bookmarkId));
  return console.log(bookmarkMovie);
}
