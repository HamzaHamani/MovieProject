import { NextRequest, NextResponse } from "next/server";

import { addMovieToProfileSection } from "@/lib/actions";
import type { StoredMediaType } from "@/lib/utils";

type SectionType = "favorites" | "likes" | "watchlist";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      section?: SectionType;
      movieId?: string | number;
      mediaType?: StoredMediaType;
    };

    if (!body?.section || !body?.movieId) {
      return NextResponse.json(
        { error: "section and movieId are required" },
        { status: 400 },
      );
    }

    if (!["favorites", "likes", "watchlist"].includes(body.section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    const result = await addMovieToProfileSection({
      section: body.section,
      movieId: body.movieId,
      mediaType: body.mediaType,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not add movie";

    if (message.toLowerCase().includes("not authenticated")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
