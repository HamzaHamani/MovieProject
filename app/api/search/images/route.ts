import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json(
        { error: "Missing id or type parameter" },
        { status: 400 }
      );
    }

    if (type !== "movie" && type !== "tv") {
      return NextResponse.json(
        { error: "Type must be 'movie' or 'tv'" },
        { status: 400 }
      );
    }

    const res = await axios.get(
      `https://api.themoviedb.org/3/${type}/${id}/images?api_key=${process.env.TMDB_API_KEY}`
    );

    const data = res.data;
    const backdrops = Array.isArray(data?.backdrops) ? data.backdrops : [];

    const formattedBackdrops = backdrops
      .filter((item: any) => item?.file_path)
      .map((item: any) => ({
        file_path: item.file_path,
        width: item.width,
        height: item.height,
        aspect_ratio: item.aspect_ratio,
        vote_average: item.vote_average,
      }))
      .slice(0, 24);

    return NextResponse.json(formattedBackdrops);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
