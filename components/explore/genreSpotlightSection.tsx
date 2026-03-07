"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { fetchExploreMovieDetails } from "@/lib/exploreClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Bookmark, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { RiStarSFill } from "react-icons/ri";
import { useCallback, useEffect, useMemo, useState } from "react";

type SpotlightMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
};

type GenreGroup = {
  key: string;
  label: string;
  movies: SpotlightMovie[];
};

type Props = {
  groups: GenreGroup[];
};

function formatRuntime(runtime: number | null): string {
  if (!runtime) {
    return "--";
  }

  const hours = Math.floor(runtime / 60);
  const mins = runtime % 60;
  return `${hours}h${mins}m`;
}

export default function GenreSpotlightSection({ groups }: Props) {
  const queryClient = useQueryClient();
  const validGroups = groups.filter((group) => group.movies.length > 0);
  const [activeGenre, setActiveGenre] = useState(0);
  const [activeMovie, setActiveMovie] = useState(0);

  const genre = validGroups[activeGenre] ?? null;

  const movie = useMemo(() => {
    if (!genre) {
      return null;
    }

    return genre.movies[activeMovie] ?? genre.movies[0] ?? null;
  }, [activeMovie, genre]);

  const movieIndex = useMemo(() => {
    if (!movie || !genre) {
      return 0;
    }

    return Math.max(
      0,
      genre.movies.findIndex((item) => item.id === movie.id),
    );
  }, [genre, movie]);

  const { data: movieDetails } = useQuery({
    queryKey: ["explore", "genre-movie-details", movie?.id],
    queryFn: async () => {
      if (!movie) {
        return null;
      }
      return fetchExploreMovieDetails(movie.id);
    },
    enabled: Boolean(movie),
  });

  useEffect(() => {
    if (!genre?.movies.length) {
      return;
    }

    const nextMovie = genre.movies[(movieIndex + 1) % genre.movies.length];
    if (!nextMovie) {
      return;
    }

    queryClient.prefetchQuery({
      queryKey: ["explore", "genre-movie-details", nextMovie.id],
      queryFn: () => fetchExploreMovieDetails(nextMovie.id),
    });
  }, [genre, movieIndex, queryClient]);

  if (!genre || !movie) {
    return null;
  }

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "----";

  const prefetchMovieAssets = useCallback((item: SpotlightMovie) => {
    if (typeof window === "undefined") {
      return;
    }

    if (item.backdrop_path) {
      const backdrop = new Image();
      backdrop.src = `https://image.tmdb.org/t/p/original/${item.backdrop_path}`;
    }

    if (item.poster_path) {
      const poster = new Image();
      poster.src = `https://image.tmdb.org/t/p/w500/${item.poster_path}`;
    }
  }, []);

  // Warm first movie of each genre as soon as section mounts.
  useEffect(() => {
    validGroups.forEach((group) => {
      const firstMovie = group.movies[0];
      if (!firstMovie) {
        return;
      }

      queryClient.prefetchQuery({
        queryKey: ["explore", "genre-movie-details", firstMovie.id],
        queryFn: () => fetchExploreMovieDetails(firstMovie.id),
      });
      prefetchMovieAssets(firstMovie);
    });
  }, [prefetchMovieAssets, queryClient, validGroups]);

  function handleGenre(index: number) {
    const selectedGenre = validGroups[index];
    if (selectedGenre?.movies?.length) {
      // After opening a genre, eagerly prefetch the other movies in it.
      selectedGenre.movies.slice(1).forEach((item) => {
        queryClient.prefetchQuery({
          queryKey: ["explore", "genre-movie-details", item.id],
          queryFn: () => fetchExploreMovieDetails(item.id),
        });
        prefetchMovieAssets(item);
      });
    }

    setActiveGenre(index);
    setActiveMovie(0);
  }

  function nextMovie() {
    setActiveMovie((prev) => (prev + 1) % genre.movies.length);
  }

  function prevMovie() {
    setActiveMovie(
      (prev) => (prev - 1 + genre.movies.length) % genre.movies.length,
    );
  }

  return (
    <section className="relative mb-14 min-h-[72vh] overflow-hidden rounded-xl lg:min-h-[68vh] h1text8:min-h-[62vh] smd:min-h-[58vh] s:min-h-[54vh]">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: movie.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original/${movie.backdrop_path})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-black/55" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/45 to-black/35" />

      <div className="flex min-h-[72vh] flex-col justify-between px-6 pb-6 pt-7 lg:min-h-[68vh] h1text8:min-h-[62vh] smd:min-h-[58vh] smd:px-4 s:px-3">
        <div className="relative max-w-[560px]">
          <p className="mb-4 text-sm font-semibold text-gray-200 smd:mb-3 smd:text-xs">
            Explore by the genre
          </p>

          <h2 className="text-5xl font-extrabold leading-tight xl:text-4xl lg:text-3xl h1text8:text-2xl smd:text-xl s:text-lg">
            {movie.title}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-200 smd:mt-3 smd:gap-1.5 smd:text-xs s:text-[11px]">
            <span className="flex items-center gap-1">
              <RiStarSFill className="h-4 w-4 text-primaryM-500 smd:h-3 smd:w-3" />
              {movie.vote_average.toFixed(1)}
            </span>
            <span>•</span>
            <span>{formatRuntime(movieDetails?.runtime ?? null)}</span>
            <span>•</span>
            <span>{year}</span>
            {(movieDetails?.genres ?? []).slice(0, 2).map((value) => (
              <span key={value.id}>• {value.name}</span>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3 smd:mt-4 smd:gap-2">
            <Link href={`/movie/${movie.id}`}>
              <Button className="bg-emerald-500 px-5 text-white hover:bg-emerald-400 smd:h-8 smd:px-3 smd:text-xs">
                <Play className="h-4 w-4" />
                Check it out
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-white/40 bg-black/30 px-5 text-white hover:bg-black/45 smd:h-8 smd:px-3 smd:text-xs"
            >
              <Bookmark className="h-4 w-4" />
              Add Watchlist
            </Button>
          </div>
        </div>

        <div className="absolute right-6 top-4 flex items-center gap-2 smd:right-4 smd:top-3 smd:gap-1.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveMovie(index)}
              onMouseEnter={() => {
                const hoveredMovie = genre.movies[index];
                if (!hoveredMovie) {
                  return;
                }

                queryClient.prefetchQuery({
                  queryKey: ["explore", "genre-movie-details", hoveredMovie.id],
                  queryFn: () => fetchExploreMovieDetails(hoveredMovie.id),
                });
                prefetchMovieAssets(hoveredMovie);
              }}
              className={`h-2 w-2 rounded-full transition-all smd:h-1.5 smd:w-1.5 ${
                index === activeMovie ? "bg-white" : "bg-white/35"
              }`}
              aria-label={`Show movie ${index + 1}`}
              disabled={index >= genre.movies.length}
            />
          ))}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prevMovie}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/65"
                aria-label="Previous movie"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextMovie}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/65"
                aria-label="Next movie"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {validGroups.map((group, index) => {
                const tabMovie = group.movies[0];

                return (
                  <CarouselItem
                    key={group.key}
                    className="basis-[260px] pl-3 xl:basis-[240px] lg:basis-[220px] h1text8:basis-[205px] smd:basis-[185px] s:basis-[170px]"
                  >
                    <button
                      type="button"
                      onClick={() => handleGenre(index)}
                      className={`group relative h-[110px] w-full overflow-hidden rounded-lg border-2 text-left transition lg:h-[102px] h1text8:h-[95px] smd:h-[88px] s:h-[82px] ${
                        activeGenre === index
                          ? "border-emerald-400"
                          : "border-white/20 hover:border-white/40"
                      }`}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: tabMovie?.backdrop_path
                            ? `url(https://image.tmdb.org/t/p/w500/${tabMovie.backdrop_path})`
                            : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                      <div className="absolute inset-0 bg-black/55" />
                      <span className="relative z-10 block p-4 text-base font-semibold text-white lg:text-sm h1text8:p-3 h1text8:text-sm smd:p-2.5 smd:text-xs s:text-[11px]">
                        {group.label}
                      </span>
                    </button>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <div className="mt-3 flex justify-end gap-2">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
