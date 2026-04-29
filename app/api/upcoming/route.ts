import { NextRequest, NextResponse } from "next/server";
import { tmdbFetch, TMDBApiError } from "@/lib/tmdb-api";
import { createSafeErrorResponse } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  try {
    const json = await tmdbFetch(
      "/movie/upcoming",
      { language: "en-US", page },
      `API: Upcoming movies (page ${page})`,
    );
    return NextResponse.json(json);
  } catch (error) {
    if (error instanceof TMDBApiError) {
      return createSafeErrorResponse(error, {
        context: "Upcoming Movies",
        statusCode: 502,
        userMessage: error.message,
      });
    }
    return createSafeErrorResponse(error, {
      context: "Upcoming Movies",
      statusCode: 502,
      userMessage: "TMDB request failed",
    });
  }
}
