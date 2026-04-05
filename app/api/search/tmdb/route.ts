import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB key missing" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1&api_key=${apiKey}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "TMDB request failed" },
        { status: 502 },
      );
    }

    const data = await response.json();

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
          year: date.slice(0, 4) || "----",
        };
      });

    return NextResponse.json(normalized);
  } catch {
    return NextResponse.json({ error: "TMDB request failed" }, { status: 502 });
  }
}
