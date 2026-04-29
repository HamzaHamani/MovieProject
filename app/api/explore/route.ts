import { NextRequest, NextResponse } from "next/server";
import { tmdbFetch, TMDBApiError } from "@/lib/tmdb-api";
import { createSafeErrorResponse } from "@/lib/api-error-handler";

type EndpointMap = Record<string, string>;

const LIST_ENDPOINTS: EndpointMap = {
  featured: "trending/all/week",
  "just-release": "movie/now_playing",
  "top-rated": "movie/top_rated",
  "popular-tv": "tv/popular",
  "on-air-today": "tv/airing_today",
  // Keep old key working so older links do not break.
  "on-the-air": "tv/airing_today",
};

async function tmdbList(endpoint: string, page = 1) {
  // Parse endpoint for any existing query params
  const hasQuery = endpoint.includes("?");
  const params: Record<string, any> = { language: "en-US", page };

  if (hasQuery) {
    const [path, queryString] = endpoint.split("?");
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    endpoint = path;
  }

  return tmdbFetch(`/${endpoint}`, params, `API: TMDB List (${endpoint})`);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const withGenres = searchParams.get("withGenres");
  const pageParam = Number(searchParams.get("page") ?? "");
  const isPaged = Number.isFinite(pageParam) && pageParam > 0;
  const appPage = isPaged ? Math.floor(pageParam) : 1;

  try {
    if (kind === "genre") {
      if (!withGenres) {
        return NextResponse.json(
          { error: "withGenres is required for kind=genre" },
          { status: 400 },
        );
      }

      const endpoint = `discover/movie?include_adult=false&include_video=false&sort_by=vote_average.desc&vote_count.gte=1200&with_genres=${withGenres}`;

      const tmdbData = await tmdbList(endpoint, appPage);
      const results = tmdbData?.results ?? [];

      if (!isPaged) {
        return NextResponse.json(results);
      }

      const totalPages: number = tmdbData?.total_pages ?? 1;

      return NextResponse.json({
        results,
        page: appPage,
        hasMore: appPage < totalPages && results.length > 0,
      });
    }

    if (!kind || !LIST_ENDPOINTS[kind]) {
      return NextResponse.json(
        { error: "Invalid kind parameter" },
        { status: 400 },
      );
    }

    const endpoint = LIST_ENDPOINTS[kind];
    const tmdbData = await tmdbList(endpoint, appPage);
    const results = tmdbData?.results ?? [];

    if (!isPaged) {
      return NextResponse.json(results);
    }

    const totalPages: number = tmdbData?.total_pages ?? 1;

    return NextResponse.json({
      results,
      page: appPage,
      hasMore: appPage < totalPages && results.length > 0,
    });
  } catch (error) {
    if (error instanceof TMDBApiError) {
      return createSafeErrorResponse(error, {
        context: "Explore",
        statusCode: 502,
        userMessage: error.message,
      });
    }
    return createSafeErrorResponse(error, {
      context: "Explore",
      statusCode: 502,
      userMessage: "TMDB request failed",
    });
  }
}
