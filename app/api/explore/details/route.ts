import { NextRequest, NextResponse } from "next/server";
import { tmdbFetch, TMDBApiError } from "@/lib/tmdb-api";
import { createSafeErrorResponse } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mediaType = searchParams.get("mediaType") as "movie" | "tv" | null;
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

  try {
    const data = await tmdbFetch(
      `/${mediaType}/${id}`,
      { language: "en-US" },
      `API: Explore details (${mediaType}, ${id})`,
    );

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof TMDBApiError) {
      return createSafeErrorResponse(error, {
        context: "Explore Details",
        statusCode: 502,
        userMessage: error.message,
      });
    }
    return createSafeErrorResponse(error, {
      context: "Explore Details",
      statusCode: 502,
      userMessage: "TMDB request failed",
    });
  }
}
