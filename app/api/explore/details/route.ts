import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mediaType = searchParams.get("mediaType");
  const id = searchParams.get("id");

  if (!mediaType || !id) {
    return NextResponse.json(
      { error: "mediaType and id are required" },
      { status: 400 },
    );
  }

  if (mediaType !== "movie" && mediaType !== "tv") {
    return NextResponse.json({ error: "Invalid mediaType" }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB key missing" }, { status: 500 });
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/${mediaType}/${id}?language=en-US&api_key=${apiKey}`,
    { next: { revalidate: 1800 } },
  );

  if (!response.ok) {
    return NextResponse.json({ error: "TMDB request failed" }, { status: 502 });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
