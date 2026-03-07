"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clapperboard, Radio, Sparkles, Trophy, Tv } from "lucide-react";
import Link from "next/link";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import FeaturedRecentSection from "@/components/explore/featuredRecentSection";
import GenreSpotlightSection from "@/components/explore/genreSpotlightSection";
import MovieTvCard from "@/components/general/movieTvCard";
import useNearViewport from "@/hooks/useNearViewport";
import {
  fetchExploreGenreMovies,
  fetchExploreNowPlayingMovies,
  fetchExploreOnTheAirTvShows,
  fetchExplorePopularTvShows,
  fetchExploreTopRatedMovies,
  fetchExploreTrendingList,
} from "@/lib/exploreClient";
import {
  ExploreMovieListItem,
  ExploreTrendingItem,
  ExploreTvListItem,
} from "@/types/explore";

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
  return items.slice(0, 10).map((item) => ({
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
  return items.slice(0, 10).map((item) => ({
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
    .slice(0, 12)
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

function ExploreSection({
  title,
  icon: Icon,
  seeMoreHref,
  cards,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  seeMoreHref: string;
  cards: ExploreCard[];
}) {
  return (
    <section className="mt-12 first:mt-0">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primaryM-500" />
          <span className="h-2 w-2 rounded-full bg-primaryM-500" />
          <span className="h-[2px] w-8 bg-primaryM-500" />
          <h2 className="text-2xl font-bold uppercase tracking-wide lg:text-xl h1text8:text-lg smd:text-base sss:text-sm">
            {title}
          </h2>
        </div>
        <Link
          href={seeMoreHref}
          className="ml-auto text-sm text-primaryM-500 transition hover:text-primaryM-300"
        >
          See More
        </Link>
      </div>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {cards.map((item) => (
            <CarouselItem
              key={`${item.media_type}-${item.id}`}
              className="basis-[280px] pl-4 xl:basis-[250px] lg:basis-[220px] h1text8:basis-[200px] smd:basis-[180px] sss:basis-[165px] s:basis-[175px]"
            >
              <MovieTvCard
                href={`/${item.media_type}/${item.id}`}
                posterPath={item.poster_path}
                title={item.title}
                voteAverage={item.vote_average}
                mediaTypeLabel={item.media_type === "movie" ? "Movie" : "TV"}
                year={item.date?.slice(0, 4) || "----"}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute -bottom-8 right-0 flex gap-2 smd:static smd:mt-3 smd:justify-end">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </section>
  );
}

function SectionCarouselSkeleton() {
  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-[2px] w-8" />
        <Skeleton className="h-7 w-44 smd:h-5 smd:w-32" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`section-skeleton-${index}`}
            className="basis-[280px] xl:basis-[250px] lg:basis-[220px] h1text8:basis-[200px] smd:basis-[180px]"
          >
            <Skeleton className="h-[360px] w-full rounded-xl xl:h-[330px] lg:h-[300px] h1text8:h-[280px] smd:h-[250px]" />
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedSkeleton() {
  return (
    <section className="relative mb-16 min-h-[62vh] overflow-hidden rounded-xl">
      <Skeleton className="absolute inset-0" />
      <div className="relative z-10 flex min-h-[62vh] flex-col justify-between p-5">
        <div className="ml-auto">
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="mb-6 flex items-end gap-6 smd:flex-col smd:items-start">
          <Skeleton className="h-[240px] w-[170px] rounded-lg smd:h-[210px] smd:w-[150px]" />
          <div className="w-full max-w-[620px] space-y-3">
            <Skeleton className="h-9 w-3/4 smd:h-7" />
            <Skeleton className="h-4 w-64 smd:h-3 smd:w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="mt-3 h-9 w-28 smd:h-8" />
          </div>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton
              key={`featured-thumb-${index}`}
              className="h-[130px] w-[90px] rounded-md"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function GenreSpotlightSkeleton() {
  return (
    <section className="relative mb-14 min-h-[58vh] overflow-hidden rounded-xl">
      <Skeleton className="absolute inset-0" />
      <div className="relative z-10 flex min-h-[58vh] flex-col justify-between p-6 smd:p-4">
        <div className="max-w-[560px] space-y-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-12 w-3/4 smd:h-8" />
          <Skeleton className="h-4 w-72" />
          <div className="flex gap-3 smd:gap-2">
            <Skeleton className="h-9 w-28 smd:h-8" />
            <Skeleton className="h-9 w-36 smd:h-8" />
          </div>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={`genre-tab-${index}`}
              className="h-[95px] w-[220px] rounded-lg smd:h-[85px] smd:w-[180px]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function JustReleaseSection({ cards }: { cards: ExploreCard[] }) {
  return (
    <section className="mt-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center gap-3">
          <Clapperboard className="h-5 w-5 text-primaryM-500" />
          <span className="h-2 w-2 rounded-full bg-primaryM-500" />
          <span className="h-[2px] w-8 bg-primaryM-500" />
          <h2 className="text-2xl font-bold uppercase tracking-wide lg:text-xl h1text8:text-lg smd:text-base sss:text-sm">
            just release
          </h2>
        </div>
        <Link
          href="/explore/just-release"
          className="ml-auto text-sm text-primaryM-500 transition hover:text-primaryM-300"
        >
          See More
        </Link>
      </div>

      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {cards.map((item) => (
            <CarouselItem
              key={`release-${item.media_type}-${item.id}`}
              className="basis-[280px] pl-4 xl:basis-[250px] lg:basis-[220px] h1text8:basis-[200px] smd:basis-[180px] sss:basis-[165px] s:basis-[175px]"
            >
              <MovieTvCard
                href={`/${item.media_type}/${item.id}`}
                posterPath={item.poster_path}
                title={item.title}
                voteAverage={item.vote_average}
                mediaTypeLabel={
                  item.media_type === "movie" ? "Movie" : "TV Show"
                }
                year={item.date?.slice(0, 4) || "----"}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute -bottom-8 right-0 flex gap-2 smd:static smd:mt-3 smd:justify-end">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </section>
  );
}

export default function ExplorePageClient() {
  const featured = useQuery({
    queryKey: ["explore", "featured"],
    queryFn: fetchExploreTrendingList,
  });

  const justRelease = useQuery({
    queryKey: ["explore", "just-release"],
    queryFn: fetchExploreNowPlayingMovies,
  });

  const { ref: genreRef, isNear: isGenreNear } =
    useNearViewport<HTMLDivElement>("120px");
  const genreSpotlight = useQuery({
    queryKey: ["explore", "genre-spotlight"],
    queryFn: async () => {
      const groups = await Promise.all(
        genreConfigs.map(async (config) => {
          const movies = await fetchExploreGenreMovies(config.withGenres);
          return {
            ...config,
            movies: movies.slice(0, 5).map((movie) => ({
              id: movie.id,
              title: movie.title,
              poster_path: movie.poster_path,
              backdrop_path: movie.backdrop_path,
              release_date: movie.release_date,
              vote_average: movie.vote_average,
            })),
          } satisfies GenreSpotlightGroup;
        }),
      );

      return groups;
    },
    enabled: isGenreNear,
  });

  const { ref: topRatedRef, isNear: isTopRatedNear } =
    useNearViewport<HTMLDivElement>("120px");
  const topRated = useQuery({
    queryKey: ["explore", "top-rated"],
    queryFn: fetchExploreTopRatedMovies,
    enabled: isTopRatedNear,
  });

  const { ref: popularTvRef, isNear: isPopularTvNear } =
    useNearViewport<HTMLDivElement>("120px");
  const popularTv = useQuery({
    queryKey: ["explore", "popular-tv"],
    queryFn: fetchExplorePopularTvShows,
    enabled: isPopularTvNear,
  });

  const { ref: onTheAirRef, isNear: isOnTheAirNear } =
    useNearViewport<HTMLDivElement>("120px");
  const onTheAir = useQuery({
    queryKey: ["explore", "on-the-air"],
    queryFn: fetchExploreOnTheAirTvShows,
    enabled: isOnTheAirNear,
  });

  const featuredCards = useMemo(
    () => mapTrendingCards(featured.data ?? []),
    [featured.data],
  );
  const justReleaseCards = useMemo(
    () => mapMovieCards(justRelease.data ?? []),
    [justRelease.data],
  );
  const topRatedCards = useMemo(
    () => mapMovieCards(topRated.data ?? []),
    [topRated.data],
  );
  const popularTvCards = useMemo(
    () => mapTvCards(popularTv.data ?? []),
    [popularTv.data],
  );
  const onTheAirCards = useMemo(
    () => mapTvCards(onTheAir.data ?? []),
    [onTheAir.data],
  );

  return (
    <div className="w-full pb-14">
      {featured.isPending && <FeaturedSkeleton />}
      {featuredCards.length > 0 && (
        <FeaturedRecentSection cards={featuredCards} />
      )}
      {featured.isError && (
        <p className="mx-auto mt-10 w-[97%] text-sm text-red-300">
          Could not load featured content.
        </p>
      )}

      <div className="mx-auto w-[97%]">
        <div>
          <div className="h-1 w-full" />
          {(justRelease.isPending || !justRelease.data) && (
            <SectionCarouselSkeleton />
          )}
          {justReleaseCards.length > 0 && (
            <JustReleaseSection cards={justReleaseCards} />
          )}
          {justRelease.isError && (
            <p className="mt-8 text-sm text-red-300">
              Could not load just release.
            </p>
          )}
        </div>

        <section ref={genreRef} className="mt-10">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primaryM-500" />
            <span className="h-2 w-2 rounded-full bg-primaryM-500" />
            <span className="h-[2px] w-8 bg-primaryM-500" />
            <h2 className="text-2xl font-bold uppercase tracking-wide lg:text-xl h1text8:text-lg smd:text-base sss:text-sm">
              genre spotlight
            </h2>
          </div>
          {(genreSpotlight.isPending || !genreSpotlight.data) &&
            isGenreNear && <GenreSpotlightSkeleton />}
          {genreSpotlight.data && genreSpotlight.data.length > 0 && (
            <GenreSpotlightSection groups={genreSpotlight.data} />
          )}
          {genreSpotlight.isError && isGenreNear && (
            <p className="mt-4 text-sm text-red-300">
              Could not load genre spotlight.
            </p>
          )}
        </section>

        <div ref={topRatedRef}>
          <div className="h-1 w-full" />
          {(topRated.isPending || !topRated.data) && isTopRatedNear && (
            <SectionCarouselSkeleton />
          )}
          {topRatedCards.length > 0 && (
            <ExploreSection
              title="top rated movies"
              icon={Trophy}
              seeMoreHref="/explore/top-rated"
              cards={topRatedCards}
            />
          )}
          {topRated.isError && isTopRatedNear && (
            <p className="mt-8 text-sm text-red-300">
              Could not load top rated movies.
            </p>
          )}
        </div>

        <div ref={popularTvRef}>
          <div className="h-1 w-full" />
          {(popularTv.isPending || !popularTv.data) && isPopularTvNear && (
            <SectionCarouselSkeleton />
          )}
          {popularTvCards.length > 0 && (
            <ExploreSection
              title="popular tv shows"
              icon={Tv}
              seeMoreHref="/explore/popular-tv"
              cards={popularTvCards}
            />
          )}
          {popularTv.isError && isPopularTvNear && (
            <p className="mt-8 text-sm text-red-300">
              Could not load popular tv shows.
            </p>
          )}
        </div>

        <div ref={onTheAirRef}>
          <div className="h-1 w-full" />
          {(onTheAir.isPending || !onTheAir.data) && isOnTheAirNear && (
            <SectionCarouselSkeleton />
          )}
          {onTheAirCards.length > 0 && (
            <ExploreSection
              title="on the air tv shows"
              icon={Radio}
              seeMoreHref="/explore/on-the-air"
              cards={onTheAirCards}
            />
          )}
          {onTheAir.isError && isOnTheAirNear && (
            <p className="mt-8 text-sm text-red-300">
              Could not load on the air tv shows.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
