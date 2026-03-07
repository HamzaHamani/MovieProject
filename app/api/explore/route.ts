import { NextRequest, NextResponse } from "next/server";

type EndpointMap = Record<string, string>;

const LIST_ENDPOINTS: EndpointMap = {
  featured: "trending/all/week",
  "just-release": "movie/now_playing",
  "top-rated": "movie/top_rated",
  "popular-tv": "tv/popular",
  "on-the-air": "tv/on_the_air",
};

async function tmdbList(endpoint: string, page = 1) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB key missing");
  }

  const hasQuery = endpoint.includes("?");
  const connector = hasQuery ? "&" : "?";
  const response = await fetch(
    `https://api.themoviedb.org/3/${endpoint}${connector}language=en-US&page=${page}&api_key=${apiKey}`,
    { next: { revalidate: 1800 } },
  );

  if (!response.ok) {
    throw new Error("TMDB request failed");
  }

  return response.json();
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
  } catch {
    return NextResponse.json({ error: "TMDB request failed" }, { status: 502 });
  }
}
