import { NextRequest, NextResponse } from "next/server";
import { and, eq, ilike, inArray, or } from "drizzle-orm";

import { db } from "@/db";
import { userFollows, users } from "@/db/schema";
import { getUser } from "@/lib/actions";

export async function GET(request: NextRequest) {
  try {
    const viewer = await getUser();
    if (!viewer?.id) return NextResponse.json({ items: [] });

    const url = new URL(request.url);
    const query = (url.searchParams.get("q") ?? "").trim();

    const [followingRows, followerRows] = await Promise.all([
      db
        .select({ followingId: userFollows.followingId })
        .from(userFollows)
        .where(eq(userFollows.followerId, viewer.id)),
      db
        .select({ followerId: userFollows.followerId })
        .from(userFollows)
        .where(eq(userFollows.followingId, viewer.id)),
    ]);

    const followingIds = followingRows.map((row) => row.followingId);
    const followerSet = new Set(followerRows.map((row) => row.followerId));
    const friendIds = followingIds.filter((userId) => followerSet.has(userId));
    const followingOnlyIds = followingIds.filter(
      (userId) => !followerSet.has(userId),
    );
    const targetIds = [...friendIds, ...followingOnlyIds];

    if (targetIds.length === 0) return NextResponse.json({ items: [] });

    const queryPattern = `%${query}%`;
    const matchClause = query
      ? or(ilike(users.username, queryPattern), ilike(users.name, queryPattern))
      : undefined;

    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        image: users.image,
      })
      .from(users)
      .where(
        matchClause
          ? and(inArray(users.id, targetIds), matchClause)
          : inArray(users.id, targetIds),
      )
      .limit(8);

    const items = rows.map((row) => ({
      id: row.id,
      username: row.username,
      name: row.name,
      image: row.image,
      source: friendIds.includes(row.id) ? "friend" : "following",
    }));

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
