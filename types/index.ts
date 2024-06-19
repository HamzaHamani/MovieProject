import { z } from "zod";

export type Bookmark = {};

export const usersSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  emailVerified: z.date().optional(),
  image: z.string().optional(),
  premium: z.boolean().default(false),
});
export const bookmarksSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bookmarkName: z.string(),
  description: z.string(),
  image: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const bookmarksMoviesSchema = z.object({
  id: z.string(),
  bookmarkId: z.string(),
  movieId: z.string(),
  review: z.string(),
  addedAt: z.date().default(() => new Date()),
});
