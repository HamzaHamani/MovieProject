"use server";

import { signOut } from "@/auth";
import { db } from "@/db";
import { bookmarks, bookmarksMovies } from "@/db/schema";
import { signIn } from "next-auth/react";

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
