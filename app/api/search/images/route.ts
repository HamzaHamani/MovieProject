import { NextRequest, NextResponse } from "next/server";
import { tmdbFetch, TMDBApiError } from "@/lib/tmdb-api";
import { createSafeErrorResponse } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const type = searchParams.get("type") as "movie" | "tv" | null;

    // Validation
    if (!id || !type) {
      return NextResponse.json(
        { error: "Missing id or type parameter" },
        { status: 400 },
      );
    }

    if (type !== "movie" && type !== "tv") {
      return NextResponse.json(
        { error: "Type must be 'movie' or 'tv'" },
        { status: 400 },
      );
    }

    // Use secure TMDB fetch
    const data = await tmdbFetch<{ backdrops: any[] }>(
      `/${type}/${id}/images`,
      {},
      `API: getImages(${type}, ${id})`
    );

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
    if (error instanceof TMDBApiError) {
      return createSafeErrorResponse(error, {
        context: "Search Images",
        statusCode: 500,
        userMessage: error.message,
      });
    }
    return createSafeErrorResponse(error, {
      context: "Search Images",
      userMessage: "Failed to fetch images",
    });
  }
}
