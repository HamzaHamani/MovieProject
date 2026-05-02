import { NextRequest, NextResponse } from "next/server";
import { asc, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { tmdbFetch, TMDBApiError } from "@/lib/tmdb-api";
import { createSafeErrorResponse } from "@/lib/api-error-handler";
import type { SearchMode, SearchResult, TsearchApiResponse } from "@/types/api";

const PAGE_SIZE = 20;

type TmdbItem = {
  id: number;
  media_type?: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  known_for_department?: string;
  known_for?: Array<{ title?: string; name?: string }>;
};

function normalizeMode(value: string | null): SearchMode {
  if (value === "film" || value === "tv" || value === "person") {
    return value;
  }

  return "all";
}

function buildTmdbResult(
  item: TmdbItem,
  kind: SearchResult["kind"],
): SearchResult {
  const title =
    kind === "tv"
      ? item.name ?? item.title ?? "Untitled"
      : item.title ?? item.name ?? "Untitled";

  const year =
    kind === "tv"
      ? item.first_air_date?.slice(0, 4) || "----"
      : kind === "person"
        ? "TMDb"
        : item.release_date?.slice(0, 4) || "----";

  const subtitle =
    kind === "person"
      ? [
          item.known_for_department,
          item.known_for?.[0]?.title ?? item.known_for?.[0]?.name,
        ]
          .filter(Boolean)
          .join(" • ") || "TMDb person"
      : kind === "tv"
        ? "TV Show"
        : "Film";

  return {
    kind,
    id: String(item.id),
    title,
    subtitle,
    imagePath:
      kind === "person"
        ? item.profile_path ?? null
        : item.poster_path ?? item.backdrop_path ?? null,
    href:
      kind === "person"
        ? `/crew/${item.id}`
        : kind === "tv"
          ? `/tv/${item.id}`
          : `/movie/${item.id}`,
    mediaLabel:
      kind === "person" ? "Person" : kind === "tv" ? "TV Show" : "Film",
    voteAverage:
      typeof item.vote_average === "number" ? item.vote_average : null,
    year,
  };
}

function buildUserResult(user: {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
}): SearchResult {
  return {
    kind: "user",
    id: user.id,
    title: user.name ?? user.username ?? "User",
    subtitle: user.username ? `@${user.username}` : "Community member",
    imagePath: user.image,
    href: user.username ? `/profile/${user.username}` : `/profile/${user.id}`,
    mediaLabel: "User",
    voteAverage: null,
    username: user.username ?? undefined,
    bio: user.bio ?? undefined,
  };
}

async function searchTmdb(query: string, mode: SearchMode, page: number) {
  if (mode === "film") {
    const data = await tmdbFetch<{
      results: TmdbItem[];
      total_pages: number;
      total_results: number;
    }>(
      "/search/movie",
      {
        query,
        include_adult: true,
        language: "en-US",
        page,
      },
      "API: Search Film",
    );

    return {
      total_pages: data.total_pages,
      total_results: data.total_results,
      results: (data.results ?? []).map((item) =>
        buildTmdbResult(item, "film"),
      ),
    };
  }

  if (mode === "tv") {
    const data = await tmdbFetch<{
      results: TmdbItem[];
      total_pages: number;
      total_results: number;
    }>(
      "/search/tv",
      {
        query,
        include_adult: true,
        language: "en-US",
        page,
      },
      "API: Search TV",
    );

    return {
      total_pages: data.total_pages,
      total_results: data.total_results,
      results: (data.results ?? []).map((item) => buildTmdbResult(item, "tv")),
    };
  }

  if (mode === "person") {
    const [people, userCountRows, userRows] = await Promise.all([
      tmdbFetch<{
        results: TmdbItem[];
        total_pages: number;
        total_results: number;
      }>(
        "/search/person",
        {
          query,
          include_adult: true,
          language: "en-US",
          page,
        },
        "API: Search Person",
      ),
      db
        .select({ count: users.id })
        .from(users)
        .where(
          or(
            ilike(users.username, `%${query}%`),
            ilike(users.name, `%${query}%`),
          ),
        ),
      db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          image: users.image,
          bio: users.bio,
        })
        .from(users)
        .where(
          or(
            ilike(users.username, `%${query}%`),
            ilike(users.name, `%${query}%`),
          ),
        )
        .orderBy(asc(users.username))
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
    ]);

    const userCount = userCountRows.length;
    const userPages = Math.max(1, Math.ceil(userCount / PAGE_SIZE));
    const tmdbResults = (people.results ?? []).map((item) =>
      buildTmdbResult(item, "person"),
    );

    return {
      total_pages: Math.max(people.total_pages, userPages),
      total_results: people.total_results + userCount,
      results: [...userRows.map(buildUserResult), ...tmdbResults],
    };
  }

  const data = await tmdbFetch<{
    results: TmdbItem[];
    total_pages: number;
    total_results: number;
  }>(
    "/search/multi",
    {
      query,
      include_adult: true,
      language: "en-US",
      page,
    },
    "API: Search All",
  );

  const results = (data.results ?? [])
    .filter(
      (item) =>
        item.media_type === "movie" ||
        item.media_type === "tv" ||
        item.media_type === "person",
    )
    .map((item) =>
      buildTmdbResult(
        item,
        item.media_type === "tv"
          ? "tv"
          : item.media_type === "person"
            ? "person"
            : "film",
      ),
    );

  return {
    total_pages: data.total_pages,
    total_results: data.total_results,
    results,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const mode = normalizeMode(searchParams.get("type"));
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  if (query.length < 2) {
    return NextResponse.json({
      page,
      total_pages: 0,
      total_results: 0,
      results: [],
    } satisfies TsearchApiResponse);
  }

  try {
    const data = await searchTmdb(query, mode, page);

    return NextResponse.json({
      page,
      ...data,
    } satisfies TsearchApiResponse);
  } catch (error) {
    if (error instanceof TMDBApiError) {
      return createSafeErrorResponse(error, {
        context: "Search API",
        statusCode: 502,
        userMessage: error.message,
      });
    }

    return createSafeErrorResponse(error, {
      context: "Search API",
      statusCode: 502,
      userMessage: "Search request failed",
    });
  }
}
