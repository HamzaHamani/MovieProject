import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { addMovieToProfileSection } from "@/lib/actions";
import type { StoredMediaType } from "@/lib/utils";

type SectionType = "favorites" | "likes" | "watchlist";

const requestSchema = z.object({
  section: z.enum(["favorites", "likes", "watchlist"]),
  movieId: z.union([z.string().trim().min(1), z.number()]),
  mediaType: z.enum(["movie", "tv"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload: section and movieId are required" },
        { status: 400 },
      );
    }

    const { section, movieId, mediaType } = parsed.data;

    const result = await addMovieToProfileSection({
      section: section as SectionType,
      movieId,
      mediaType: mediaType as StoredMediaType | undefined,
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
