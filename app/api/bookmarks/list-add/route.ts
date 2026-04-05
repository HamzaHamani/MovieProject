import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { AddMovie, getUser } from "@/lib/actions";
import type { StoredMediaType } from "@/lib/utils";
import { and, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await request.json()) as {
      bookmarkId?: string;
      movieId?: string | number;
      mediaType?: StoredMediaType;
    };

    if (!body?.bookmarkId || !body?.movieId) {
      return NextResponse.json(
        { error: "bookmarkId and movieId are required" },
        { status: 400 },
      );
    }

    const ownedList = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(
        and(eq(bookmarks.id, body.bookmarkId), eq(bookmarks.userId, user.id)),
      )
      .limit(1);

    if (ownedList.length === 0) {
      return NextResponse.json(
        { error: "List not found or access denied" },
        { status: 404 },
      );
    }

    const result = await AddMovie({
      bookmarkId: body.bookmarkId,
      movieId: String(body.movieId),
      mediaType: body.mediaType,
      review: "",
    });

    return NextResponse.json({ already: result?.already ?? false });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not add movie";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
