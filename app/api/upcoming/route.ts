import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY is missing" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=${page}&api_key=${apiKey}`,
      { next: { revalidate: 1800 } },
    );

    if (!response.ok) {
      return NextResponse.json({ error: "TMDB request failed" }, { status: 502 });
    }

    const json = await response.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ error: "TMDB request failed" }, { status: 502 });
  }
}
