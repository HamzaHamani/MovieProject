import { getLoggedMoviesForUser } from "@/lib/actions";
import { decodeStoredMediaId } from "@/lib/utils";
import { getSpecifiedMovie, getSpecifiedTV } from "@/lib/actions";
import { NextRequest, NextResponse } from "next/server";

async function resolveMediaById(id: string) {
  const decoded = decodeStoredMediaId(id);
  const resolvedId = decoded.id;
  if (!resolvedId) return null;

  if (decoded.mediaType === "tv") {
    try {
      const tv = await getSpecifiedTV(resolvedId);
      return {
        id: resolvedId,
        title: tv.name ?? "Untitled",
        posterPath: tv.poster_path,
        voteAverage: Number(tv.vote_average ?? 0),
        mediaTypeLabel: "TV Show",
        year: tv.first_air_date?.slice(0, 4) ?? "----",
        href: `/tv/${resolvedId}`,
      };
    } catch {
      return null;
    }
  }

  if (decoded.mediaType === "movie") {
    try {
      const movie = await getSpecifiedMovie(resolvedId);
      return {
        id: resolvedId,
        title: movie.title ?? "Untitled",
        posterPath: movie.poster_path,
        voteAverage: Number(movie.vote_average ?? 0),
        mediaTypeLabel: "Movie",
        year: movie.release_date?.slice(0, 4) ?? "----",
        href: `/movie/${resolvedId}`,
      };
    } catch {
      return null;
    }
  }

  try {
    const movie = await getSpecifiedMovie(resolvedId);
    return {
      id: resolvedId,
      title: movie.title ?? "Untitled",
      posterPath: movie.poster_path,
      voteAverage: Number(movie.vote_average ?? 0),
      mediaTypeLabel: "Movie",
      year: movie.release_date?.slice(0, 4) ?? "----",
      href: `/movie/${resolvedId}`,
    };
  } catch {
    try {
      const tv = await getSpecifiedTV(resolvedId);
      return {
        id: resolvedId,
        title: tv.name ?? "Untitled",
        posterPath: tv.poster_path,
        voteAverage: Number(tv.vote_average ?? 0),
        mediaTypeLabel: "TV Show",
        year: tv.first_air_date?.slice(0, 4) ?? "----",
        href: `/tv/${resolvedId}`,
      };
    } catch {
      return null;
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const loggedMovies = await getLoggedMoviesForUser(userId);

    const resolvedPairs = await Promise.all(
      loggedMovies.map(
        async (item) =>
          [item.showId, await resolveMediaById(item.showId)] as const,
      ),
    );

    const mediaMap = Object.fromEntries(resolvedPairs);

    return NextResponse.json(mediaMap);
  } catch (error) {
    console.error("Error fetching watched media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 },
    );
  }
}
