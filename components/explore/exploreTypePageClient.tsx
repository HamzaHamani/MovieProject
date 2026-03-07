"use client";

import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Clapperboard, Flame, Radio, Sparkles, Trophy, Tv } from "lucide-react";

import MovieTvCard from "@/components/general/movieTvCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchExplorePaged } from "@/lib/exploreClient";
import {
  ExplorePagedResponse,
  ExploreMovieListItem,
  ExploreTrendingItem,
  ExploreTvListItem,
} from "@/types/explore";

type ExploreType =
  | "featured"
  | "just-release"
  | "top-rated"
  | "popular-tv"
  | "on-the-air"
  | "genre";

type ExploreCard = {
  id: number;
  media_type: "movie" | "tv";
  poster_path: string | null;
  backdrop_path: string | null;
  title: string;
  date: string;
  vote_average: number;
};

type GenreSpotlightMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
};

type GenreSpotlightGroup = {
  key: string;
  label: string;
  withGenres: string;
  movies: GenreSpotlightMovie[];
};

const genreConfigs: Omit<GenreSpotlightGroup, "movies">[] = [
  { key: "superhero", label: "Superhero", withGenres: "28,12,878" },
  { key: "drama", label: "Drama", withGenres: "18" },
  { key: "sitcom", label: "Sitcom", withGenres: "35" },
  { key: "thriller", label: "Thriller", withGenres: "53" },
  { key: "comedy", label: "Comedy", withGenres: "35" },
  { key: "fantasy", label: "Fantasy", withGenres: "14" },
  { key: "horror", label: "Horror", withGenres: "27" },
  { key: "adventure", label: "Adventure", withGenres: "12" },
  { key: "animation", label: "Animation", withGenres: "16" },
  { key: "romance", label: "Romance", withGenres: "10749" },
];

function mapMovieCards(items: ExploreMovieListItem[]): ExploreCard[] {
  return items.map((item) => ({
    id: item.id,
    media_type: "movie",
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    title: item.title,
    date: item.release_date,
    vote_average: item.vote_average,
  }));
}

function mapTvCards(items: ExploreTvListItem[]): ExploreCard[] {
  return items.map((item) => ({
    id: item.id,
    media_type: "tv",
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    title: item.name,
    date: item.first_air_date,
    vote_average: item.vote_average,
  }));
}

function mapTrendingCards(items: ExploreTrendingItem[]): ExploreCard[] {
  return items
    .filter(
      (item): item is ExploreTrendingItem & { media_type: "movie" | "tv" } =>
        item.media_type === "movie" || item.media_type === "tv",
    )
    .map((item) => ({
      id: item.id,
      media_type: item.media_type,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      title: item.media_type === "movie" ? item.title ?? "" : item.name ?? "",
      date:
        item.media_type === "movie"
          ? item.release_date ?? ""
          : item.first_air_date ?? "",
      vote_average: item.vote_average,
    }));
}

function Header({ type }: { type: ExploreType }) {
  const config: Record<
    Exclude<ExploreType, "genre">,
    { title: string; Icon: React.ComponentType<{ className?: string }> }
  > = {
    featured: { title: "popular recently", Icon: Flame },
    "just-release": { title: "just release", Icon: Clapperboard },
    "top-rated": { title: "top rated movies", Icon: Trophy },
    "popular-tv": { title: "popular tv shows", Icon: Tv },
    "on-the-air": { title: "on the air tv shows", Icon: Radio },
  };

  if (type === "genre") {
    return (
      <div className="mb-8 flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primaryM-500" />
        <span className="h-2 w-2 rounded-full bg-primaryM-500" />
        <span className="h-[2px] w-8 bg-primaryM-500" />
        <h1 className="text-3xl font-bold uppercase tracking-wide lg:text-2xl h1text8:text-xl smd:text-lg sss:text-base">
          genre spotlight
        </h1>
      </div>
    );
  }

  const { title, Icon } = config[type];
  return (
    <div className="mb-8 flex items-center gap-3">
      <Icon className="h-5 w-5 text-primaryM-500" />
      <span className="h-2 w-2 rounded-full bg-primaryM-500" />
      <span className="h-[2px] w-8 bg-primaryM-500" />
      <h1 className="text-3xl font-bold uppercase tracking-wide lg:text-2xl h1text8:text-xl smd:text-lg sss:text-base">
        {title}
      </h1>
    </div>
  );
}

function CardsGrid({ cards }: { cards: ExploreCard[] }) {
  return (
    <div className="grid grid-cols-5 justify-items-center gap-4 xxl:grid-cols-4 ds:grid-cols-3 xssmd:grid-cols-2 s:grid-cols-1">
      {cards.map((item) => (
        <MovieTvCard
          key={`${item.media_type}-${item.id}`}
          href={`/${item.media_type}/${item.id}`}
          posterPath={item.poster_path}
          title={item.title}
          voteAverage={item.vote_average}
          mediaTypeLabel={item.media_type === "movie" ? "Movie" : "TV Show"}
          year={item.date?.slice(0, 4) || "----"}
          className="w-[300px] self-center xl:w-[280px] lg:w-[270px] h1text8:w-[240px] xsmd:w-[270px] smd:w-[230px] sss:w-[210px] s:w-[230px]"
          imageClassName="h-[430px] lg:h-[390px] h1text8:h-[360px] xsmd:h-[390px] smd:h-[330px] sss:h-[320px] s:h-[350px]"
        />
      ))}
    </div>
  );
}

function GridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-5 justify-items-center gap-4 xxl:grid-cols-4 ds:grid-cols-3 xssmd:grid-cols-2 s:grid-cols-1">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={`type-page-skeleton-${index}`}
          className="h-[430px] w-[300px] rounded-xl xl:w-[280px] lg:h-[390px] lg:w-[270px] h1text8:h-[360px] h1text8:w-[240px] xsmd:h-[390px] xsmd:w-[270px] smd:h-[330px] smd:w-[230px] sss:h-[320px] sss:w-[210px] s:h-[350px] s:w-[230px]"
        />
      ))}
    </div>
  );
}

export default function ExploreTypePageClient({ type }: { type: ExploreType }) {
  const isGenre = type === "genre";

  const sectionQuery = useInfiniteQuery({
    queryKey: ["explore", "type-page", type, "infinite"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await fetchExplorePaged(type, pageParam);
      return response as ExplorePagedResponse<
        ExploreTrendingItem | ExploreMovieListItem | ExploreTvListItem
      >;
    },
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    enabled: !isGenre,
  });

  const genreQuery = useInfiniteQuery({
    queryKey: ["explore", "type-page", "genre"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const results = await Promise.all(
        genreConfigs.map(async (config) => {
          const res = await fetchExplorePaged(
            "genre",
            pageParam,
            config.withGenres,
          );
          return {
            key: config.key,
            label: config.label,
            movies: mapMovieCards(
              (res.results as ExploreMovieListItem[]).map((item) => ({
                ...item,
                title: item.title,
              })),
            ),
            hasMore: res.hasMore,
          };
        }),
      );

      return results;
    },
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.some((group) => group.hasMore) ? lastPageParam + 1 : undefined,
    enabled: isGenre,
  });

  const cards = useMemo(() => {
    const pages = sectionQuery.data?.pages ?? [];
    const merged = pages.flatMap((page) => page.results);

    switch (type) {
      case "featured":
        return mapTrendingCards(merged as ExploreTrendingItem[]);
      case "popular-tv":
      case "on-the-air":
        return mapTvCards(merged as ExploreTvListItem[]);
      default:
        return mapMovieCards(merged as ExploreMovieListItem[]);
    }
  }, [sectionQuery.data?.pages, type]);

  const genreMerged = useMemo(() => {
    const pages = genreQuery.data?.pages ?? [];
    const byKey = new Map<string, { label: string; cards: ExploreCard[] }>();

    pages.forEach((page) => {
      page.forEach((group) => {
        const existing = byKey.get(group.key);
        if (!existing) {
          byKey.set(group.key, { label: group.label, cards: group.movies });
          return;
        }

        const existingIds = new Set(existing.cards.map((item) => item.id));
        const nextCards = group.movies.filter(
          (item) => !existingIds.has(item.id),
        );
        existing.cards = [...existing.cards, ...nextCards];
      });
    });

    return Array.from(byKey.entries()).map(([key, value]) => ({
      key,
      label: value.label,
      cards: value.cards,
    }));
  }, [genreQuery.data?.pages]);

  return (
    <div className="mx-auto w-[97%] pb-14 pt-24">
      <Header type={type} />

      {!isGenre && sectionQuery.isPending && <GridSkeleton count={20} />}
      {!isGenre && sectionQuery.isError && (
        <p className="text-sm text-red-300">Could not load this section.</p>
      )}
      {!isGenre && cards.length > 0 && <CardsGrid cards={cards} />}
      {!isGenre && sectionQuery.isFetchingNextPage && (
        <GridSkeleton count={20} />
      )}

      {!isGenre && sectionQuery.hasNextPage && !sectionQuery.isPending && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => sectionQuery.fetchNextPage()}
            disabled={sectionQuery.isFetchingNextPage}
            className="rounded-md bg-primaryM-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-primaryM-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {sectionQuery.isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {isGenre && genreQuery.isPending && <GridSkeleton count={20} />}
      {isGenre && genreQuery.isError && (
        <p className="text-sm text-red-300">Could not load genre data.</p>
      )}
      {isGenre &&
        genreMerged.map((group) => (
          <section key={group.key} className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold uppercase tracking-wide lg:text-xl smd:text-lg sss:text-base">
              {group.label}
            </h2>
            <CardsGrid cards={group.cards} />
          </section>
        ))}
      {isGenre && genreQuery.isFetchingNextPage && <GridSkeleton count={20} />}

      {isGenre && genreQuery.hasNextPage && !genreQuery.isPending && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => genreQuery.fetchNextPage()}
            disabled={genreQuery.isFetchingNextPage}
            className="rounded-md bg-primaryM-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-primaryM-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {genreQuery.isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
