import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/actions";
import { db } from "@/db";
import { bookmarksMovies, bookmarks } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

type SectionType = "favorites" | "likes" | "watchlist";

const requestSchema = z.object({
  section: z.enum(["favorites", "likes", "watchlist"]),
  movieId: z.union([z.string().trim().min(1), z.number()]),
});

const favoriteKeywords = ["favorite", "favourite", "fav"];
const likedKeywords = ["liked", "like", "love", "loved"];
const watchlistKeywords = ["watchlist", "watch later", "to watch", "queue"];

function matchesKeywords(value: string, keywords: string[]) {
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload: section and movieId are required" },
        { status: 400 },
      );
    }

    const { section, movieId } = parsed.data;

    // Get all bookmarks for the user
    const allBookmarks = await db.query.bookmarks.findMany({
      where: (bookmarks, { eq }) => eq(bookmarks.userId, user.id),
    });

    // Filter bookmarks by section type
    const matcher = {
      favorites: (list: (typeof allBookmarks)[number]) =>
        matchesKeywords(list.bookmarkName, favoriteKeywords),
      likes: (list: (typeof allBookmarks)[number]) =>
        matchesKeywords(list.bookmarkName, likedKeywords),
      watchlist: (list: (typeof allBookmarks)[number]) =>
        matchesKeywords(list.bookmarkName, watchlistKeywords),
    }[section as SectionType];

    const sectionBookmarks = allBookmarks.filter(matcher);

    if (sectionBookmarks.length === 0) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const bookmarkIds = sectionBookmarks.map((b) => b.id);

    // Remove the movie from all bookmarks in this section
    await db
      .delete(bookmarksMovies)
      .where(
        and(
          inArray(bookmarksMovies.bookmarkId, bookmarkIds),
          eq(bookmarksMovies.movieId, String(movieId)),
        ),
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not remove movie";

    if (message.toLowerCase().includes("not authenticated")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
