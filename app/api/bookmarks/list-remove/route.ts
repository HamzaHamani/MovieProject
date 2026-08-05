import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import {
  RemoveMovie,
  ensureBookmarkPrivacyColumn,
  getUser,
} from "@/lib/actions";
import { and, eq } from "drizzle-orm";

const requestSchema = z.object({
  bookmarkId: z.string().trim().min(1),
  movieId: z.union([z.string().trim().min(1), z.number()]),
});

export async function POST(request: NextRequest) {
  try {
    await ensureBookmarkPrivacyColumn();

    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload: bookmarkId and movieId are required" },
        { status: 400 },
      );
    }

    const { bookmarkId, movieId } = parsed.data;

    const ownedList = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, user.id)))
      .limit(1);

    if (ownedList.length === 0) {
      return NextResponse.json(
        { error: "List not found or access denied" },
        { status: 404 },
      );
    }

    const result = await RemoveMovie({
      bookmarkId,
      movieId: String(movieId),
    });

    return NextResponse.json({ removed: result?.removed ?? false });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not remove movie";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
