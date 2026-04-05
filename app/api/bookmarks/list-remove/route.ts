import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { RemoveMovie, getUser } from "@/lib/actions";
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

    const result = await RemoveMovie({
      bookmarkId: body.bookmarkId,
      movieId: String(body.movieId),
    });

    return NextResponse.json({ removed: result?.removed ?? false });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not remove movie";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
