"use server";

import { db } from "@/db";
import { bookmarks, bookmarksMovies } from "@/db/schema";

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
