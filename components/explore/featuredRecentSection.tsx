"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { fetchExploreMediaDetails } from "@/lib/exploreClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { GrDocumentMissing } from "react-icons/gr";
import { RiStarSFill } from "react-icons/ri";
import { useEffect, useMemo, useState } from "react";

type FeaturedCard = {
  id: number;
  media_type: "movie" | "tv";
  poster_path: string | null;
  backdrop_path: string | null;
  title: string;
  date: string;
  vote_average: number;
};

type FeaturedDetails = {
  genres: { id: number; name: string }[];
  runtime: number | null;
  number_of_seasons: number | null;
  number_of_episodes: number | null;
};

type Props = {
  cards: FeaturedCard[];
};

export default function FeaturedRecentSection({ cards }: Props) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(
    cards[0]?.id ?? null,
  );

  const selectedItem = useMemo(() => {
    return cards.find((item) => item.id === selectedId) ?? cards[0] ?? null;
  }, [cards, selectedId]);

  const selectedIndex = useMemo(() => {
    if (!selectedItem) {
      return 0;
    }

    return Math.max(
      0,
      cards.findIndex((item) => item.id === selectedItem.id),
    );
  }, [cards, selectedItem]);

  const { data: selectedDetails } = useQuery({
    queryKey: [
      "explore",
      "featured-details",
      selectedItem?.media_type,
      selectedItem?.id,
    ],
    queryFn: async () => {
      if (!selectedItem) {
        return null;
      }
      return fetchExploreMediaDetails(selectedItem.media_type, selectedItem.id);
    },
    enabled: Boolean(selectedItem),
  });

  useEffect(() => {
    if (!cards.length) {
      return;
    }

    const nextItem = cards[(selectedIndex + 1) % cards.length];
    if (!nextItem) {
      return;
    }

    queryClient.prefetchQuery({
      queryKey: [
        "explore",
        "featured-details",
        nextItem.media_type,
        nextItem.id,
      ],
      queryFn: () => fetchExploreMediaDetails(nextItem.media_type, nextItem.id),
    });
  }, [cards, queryClient, selectedIndex]);

  if (!selectedItem) {
    return null;
  }

  return (
    <section className="relative mb-16 min-h-[82vh] overflow-hidden lg:min-h-[74vh] h1text8:min-h-[68vh] smd:min-h-[62vh] s:min-h-[58vh]">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: selectedItem.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original/${selectedItem.backdrop_path})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-black/65" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/35 to-black/30" />

      <div className="mt-14 flex min-h-[82vh] flex-col justify-between px-5 pb-6 pt-5 lg:min-h-[74vh] h1text8:min-h-[68vh] smd:min-h-[62vh] smd:px-4 s:px-3">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex items-center gap-3"></div>
          <Link
            href="/explore/featured"
            className="ml-auto flex items-center gap-1 text-sm text-primaryM-500 transition hover:text-primaryM-300"
          >
            See More
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-6 flex items-end gap-6 lg:gap-4 smd:flex-col smd:items-start">
          <div
            className={`group relative flex h-[280px] w-[200px] cursor-pointer overflow-hidden rounded lg:h-[255px] lg:w-[185px] h1text8:h-[235px] h1text8:w-[170px] smd:h-[210px] smd:w-[150px] s:h-[190px] s:w-[135px] ${selectedItem.poster_path ? "" : "items-center justify-center bg-gray-600"}`}
          >
            {selectedItem.poster_path ? (
              <img
                loading="lazy"
                src={`https://image.tmdb.org/t/p/w500/${selectedItem.poster_path}`}
                alt={`${selectedItem.title} poster`}
                className="h-full w-full object-cover"
              />
            ) : (
              <h3 className="text-center">
                <GrDocumentMissing className="text-4xl" />
              </h3>
            )}
          </div>

          <div className="max-w-[640px]">
            <h3 className="text-3xl font-bold lg:text-2xl h1text8:text-xl smd:text-lg s:text-base">
              {selectedItem.title}
            </h3>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-200 smd:gap-2 smd:text-xs s:text-[11px]">
              <span>{selectedItem.date || "-"}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <RiStarSFill className="text-base text-primaryM-500 smd:text-sm" />
                {selectedItem.vote_average.toFixed(1)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-200 smd:text-xs s:text-[11px]">
              {(selectedDetails?.genres ?? []).slice(0, 3).map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full border border-white/30 px-2 py-1 smd:px-1.5 smd:py-0.5"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-100 smd:gap-2 smd:text-xs s:text-[11px]">
              {selectedItem.media_type === "movie" &&
                selectedDetails?.runtime && (
                  <span>Runtime: {selectedDetails.runtime} min</span>
                )}

              {selectedItem.media_type === "tv" && (
                <>
                  {selectedDetails?.number_of_seasons && (
                    <span>Seasons: {selectedDetails.number_of_seasons}</span>
                  )}
                  {selectedDetails?.number_of_episodes && (
                    <span>Episodes: {selectedDetails.number_of_episodes}</span>
                  )}
                </>
              )}
            </div>

            <div className="mt-4">
              <Link href={`/${selectedItem.media_type}/${selectedItem.id}`}>
                <Button className="bg-primaryM-500 text-black hover:bg-primaryM-300 smd:h-8 smd:px-3 smd:text-xs">
                  More Details
                </Button>
              </Link>
            </div>
          </div>
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
                className="basis-[110px] pl-4 h1text8:basis-[100px] smd:basis-[90px] smd:pl-3 s:basis-[82px]"
              >
                <button
                  type="button"
                  className={`relative h-[150px] w-[100px] overflow-hidden rounded border-2 transition-all h1text8:h-[138px] h1text8:w-[95px] smd:h-[122px] smd:w-[84px] s:h-[110px] s:w-[75px] ${
                    selectedItem.id === item.id
                      ? "border-primaryM-500"
                      : "border-transparent opacity-90 hover:opacity-100"
                  } ${item.poster_path ? "" : "bg-gray-600"}`}
                  onClick={() => setSelectedId(item.id)}
                  onMouseEnter={() => {
                    queryClient.prefetchQuery({
                      queryKey: [
                        "explore",
                        "featured-details",
                        item.media_type,
                        item.id,
                      ],
                      queryFn: () =>
                        fetchExploreMediaDetails(item.media_type, item.id),
                    });
                  }}
                >
                  {item.poster_path ? (
                    <img
                      loading="lazy"
                      src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
                      alt={`${item.title} poster`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <GrDocumentMissing className="text-2xl" />
                    </div>
                  )}
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-4 flex justify-end gap-2">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
