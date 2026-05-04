import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities, userFollows, users } from "@/db/schema";
import { getUser } from "@/lib/actions";
import { and, desc, eq, inArray } from "drizzle-orm";
import { decodeStoredMediaId } from "@/lib/utils";
import { getSpecifiedMovie, getSpecifiedTV } from "@/lib/actions";

type CachedTitleEntry = {
  value: string | null;
  expiresAt: number;
};

const titleCache = new Map<string, CachedTitleEntry>();
const titleCacheTtlMs = 1000 * 60 * 30;

async function resolveCachedTitle(
  cacheKey: string,
  resolver: () => Promise<string | null>,
) {
  const now = Date.now();
  const cached = titleCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await resolver();
  titleCache.set(cacheKey, { value, expiresAt: now + titleCacheTtlMs });
  return value;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const perPage = Math.min(
      50,
      Math.max(5, Number(url.searchParams.get("perPage") ?? 10)),
    );
    const userFilter = url.searchParams.get("user") ?? null;
    const since = url.searchParams.get("since")
      ? new Date(String(url.searchParams.get("since")))
      : null;
    const until = url.searchParams.get("until")
      ? new Date(String(url.searchParams.get("until")))
      : null;

    const viewer = await getUser();
    if (!viewer?.id) return NextResponse.json({ items: [], total: 0 });

    const followingRows = await db
      .select({ followingId: userFollows.followingId })
      .from(userFollows)
      .where(eq(userFollows.followerId, viewer.id));

    const followingIds = followingRows.map((r) => r.followingId);
    if (followingIds.length === 0)
      return NextResponse.json({ items: [], total: 0 });

    const whereClauses: any[] = [inArray(activities.userId, followingIds)];
    if (userFilter) {
      const matchedUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, userFilter))
        .limit(1);
      const resolvedUserId = matchedUser[0]?.id ?? userFilter;
      whereClauses.push(eq(activities.userId, resolvedUserId));
    }
    if (since) whereClauses.push((activities as any).createdAt.gte(since));
    if (until) whereClauses.push((activities as any).createdAt.lte(until));

    const rows = await db
      .select({
        id: activities.id,
        userId: activities.userId,
        type: activities.type,
        referenceId: activities.referenceId,
        targetId: activities.targetId,
        message: activities.message,
        data: activities.data,
        createdAt: activities.createdAt,
        username: users.username,
        image: users.image,
      })
      .from(activities)
      .leftJoin(users, eq(users.id, activities.userId))
      .where(and(...whereClauses))
      .orderBy(desc(activities.createdAt))
      .limit(perPage)
      .offset((page - 1) * perPage);

    const items = [];
    for (const row of rows) {
      const item: any = { ...row };
      item.resolvedTitle = null;
      item.itemTitle = null;
      item.href = null;
      try {
        if (
          (row.type === "watched" || row.type === "review_posted") &&
          row.targetId
        ) {
          const decoded = decodeStoredMediaId(String(row.targetId));
          if (decoded.id) {
            item.href =
              decoded.mediaType === "tv"
                ? `/tv/${decoded.id}`
                : `/movie/${decoded.id}`;
            if (decoded.mediaType === "tv") {
              item.resolvedTitle = await resolveCachedTitle(
                `tv:${decoded.id}`,
                async () => {
                  const tv = await getSpecifiedTV(decoded.id);
                  return tv.name ?? null;
                },
              );
            } else {
              item.resolvedTitle = await resolveCachedTitle(
                `movie:${decoded.id}`,
                async () => {
                  const movie = await getSpecifiedMovie(decoded.id);
                  return movie.title ?? null;
                },
              );
            }
          }
        }

        if (row.type === "list_item_added" && row.message) {
          const decoded = decodeStoredMediaId(String(row.message));
          if (decoded.id) {
            if (decoded.mediaType === "tv") {
              item.itemTitle = await resolveCachedTitle(
                `tv:${decoded.id}`,
                async () => {
                  const tv = await getSpecifiedTV(decoded.id);
                  return tv.name ?? null;
                },
              );
            } else {
              item.itemTitle = await resolveCachedTitle(
                `movie:${decoded.id}`,
                async () => {
                  const movie = await getSpecifiedMovie(decoded.id);
                  return movie.title ?? null;
                },
              );
            }
          }
        }
      } catch (e) {
        // ignore resolution errors
      }

      if (row.type === "list_created" && row.referenceId) {
        item.href = `/list/${row.referenceId}`;
      }
      if (
        (row.type === "list_item_added" || row.type === "list_liked") &&
        row.targetId
      ) {
        item.href = `/list/${row.targetId}`;
      }
      if (
        (row.type === "review_liked" || row.type === "review_replied") &&
        row.targetId
      ) {
        item.href = `/review/${row.targetId}`;
      }

      items.push(item);
    }

    return NextResponse.json({ items, page, perPage });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
