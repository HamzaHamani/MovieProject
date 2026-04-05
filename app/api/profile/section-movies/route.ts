import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/actions";
import { db } from "@/db";
import { bookmarksMovies } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type SectionType = "favorites" | "likes" | "watchlist";

const favoriteKeywords = ["favorite", "favourite", "fav"];
const likedKeywords = ["liked", "like", "love", "loved"];
const watchlistKeywords = ["watchlist", "watch later", "to watch", "queue"];

function matchesKeywords(value: string, keywords: string[]) {
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const section = request.nextUrl.searchParams.get(
      "section",
    ) as SectionType | null;

    if (!section || !["favorites", "likes", "watchlist"].includes(section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

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
    }[section];

    const sectionBookmarks = allBookmarks.filter(matcher);

    if (sectionBookmarks.length === 0) {
      return NextResponse.json([]);
    }

    const bookmarkIds = sectionBookmarks.map((b) => b.id);

    // Get all movies in these bookmarks
    const movies = await db.query.bookmarksMovies.findMany({
      where: (bm, { inArray }) => inArray(bm.bookmarkId, bookmarkIds),
      with: {
        bookmark: true,
      },
    });

    // Fetch movie details from TMDB for each movie
    const movieDetails = await Promise.all(
      movies.map(async (m) => {
        try {
          // Try to fetch as movie first
          const movieRes = await fetch(
            `https://api.themoviedb.org/3/movie/${m.movieId}?api_key=${process.env.TMDB_API_KEY}`,
          );

          if (movieRes.ok) {
            const data = (await movieRes.json()) as {
              title?: string;
              poster_path?: string;
              release_date?: string;
            };
            return {
              movieId: m.movieId,
              title: data.title ?? "Untitled",
              posterPath: data.poster_path,
              year: data.release_date?.slice(0, 4) ?? "----",
              mediaTypeLabel: "Movie" as const,
            };
          }

          // Try as TV if not a movie
          const tvRes = await fetch(
            `https://api.themoviedb.org/3/tv/${m.movieId}?api_key=${process.env.TMDB_API_KEY}`,
          );

          if (tvRes.ok) {
            const data = (await tvRes.json()) as {
              name?: string;
              poster_path?: string;
              first_air_date?: string;
            };
            return {
              movieId: m.movieId,
              title: data.name ?? "Untitled",
              posterPath: data.poster_path,
              year: data.first_air_date?.slice(0, 4) ?? "----",
              mediaTypeLabel: "TV Show" as const,
            };
          }

          return {
            movieId: m.movieId,
            title: "Untitled",
            posterPath: null,
            year: "----",
            mediaTypeLabel: "Movie" as const,
          };
        } catch {
          return {
            movieId: m.movieId,
            title: "Untitled",
            posterPath: null,
            year: "----",
            mediaTypeLabel: "Movie" as const,
          };
        }
      }),
    );

    return NextResponse.json(movieDetails);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not fetch movies";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
