import { NextRequest, NextResponse } from "next/server";
import { tmdbFetch, TMDBApiError } from "@/lib/tmdb-api";
import { createSafeErrorResponse } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const data = await tmdbFetch<{ results: any[] }>(
      "/search/multi",
      {
        query,
        include_adult: false,
        language: "en-US",
        page: 1,
      },
      "API: Search TMDB"
    );

    const normalized = (data?.results ?? [])
      .filter(
        (item: Record<string, unknown>) =>
          item.media_type === "movie" || item.media_type === "tv",
      )
      .slice(0, 20)
      .map((item: Record<string, unknown>) => {
        const id = String(item.id ?? "");
        const mediaType = item.media_type === "tv" ? "tv" : "movie";
        const title =
          mediaType === "tv"
            ? String(item.name ?? "Untitled")
            : String(item.title ?? "Untitled");
        const date =
          mediaType === "tv"
            ? String(item.first_air_date ?? "")
            : String(item.release_date ?? "");

        return {
          id,
          mediaType,
          title,
          posterPath:
            typeof item.poster_path === "string" ? item.poster_path : null,
          backdropPath:
            typeof item.backdrop_path === "string" ? item.backdrop_path : null,
          year: date.slice(0, 4) || "----",
        };
      });

    return NextResponse.json(normalized);
  } catch (error) {
    if (error instanceof TMDBApiError) {
      return createSafeErrorResponse(error, {
        context: "Search TMDB",
        statusCode: 502,
        userMessage: error.message,
      });
    }
    return createSafeErrorResponse(error, {
      context: "Search TMDB",
      statusCode: 502,
      userMessage: "TMDB request failed",
    });
  }
}
