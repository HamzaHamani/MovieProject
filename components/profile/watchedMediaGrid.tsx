"use client";

import { useState, useMemo } from "react";
import {
  useWatchedMedia,
  type WatchedMediaItem,
} from "@/hooks/useWatchedMedia";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import Link from "next/link";
import { Star, Film, Tv, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type FilterType = "all" | "movie" | "tv";

interface ResolvedMedia {
  id: string;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  mediaTypeLabel: "Movie" | "TV Show";
  year: string;
  href: string;
}

interface WatchedMediaGridProps {
  userId: string;
  initialFilter?: FilterType;
}

export function WatchedMediaGrid({
  userId,
  initialFilter = "all",
}: WatchedMediaGridProps) {
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const { data: watchedItems, isLoading } = useWatchedMedia(userId);

  // Fetch media details via API
  const { data: mediaMap } = useQuery({
    queryKey: ["watchedMediaDetails", userId],
    queryFn: async () => {
      const response = await fetch(`/api/watched-media?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch media details");
      const data = await response.json();
      return data as Record<string, ResolvedMedia | null>;
    },
    enabled: !!watchedItems && watchedItems.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Filter watched items based on selected filter
  const filteredItems = useMemo(() => {
    if (!watchedItems) return [];

    return watchedItems.filter((item) => {
      if (filter === "all") return true;
      if (filter === "movie") return item.mediaType === "movie";
      if (filter === "tv") return item.mediaType === "tv";
      return true;
    });
  }, [watchedItems, filter]);

  const movieCount =
    watchedItems?.filter((item) => item.mediaType === "movie").length ?? 0;
  const tvCount =
    watchedItems?.filter((item) => item.mediaType === "tv").length ?? 0;
  const totalCount = watchedItems?.length ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-gray-400">Loading watched media...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
            filter === "all"
              ? "border border-primaryM-500/40 bg-primaryM-500/20 text-primaryM-400"
              : "border border-white/10 bg-white/[0.05] text-gray-300 hover:bg-white/10"
          }`}
        >
          <span>All</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => setFilter("movie")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
            filter === "movie"
              ? "border border-primaryM-500/40 bg-primaryM-500/20 text-primaryM-400"
              : "border border-white/10 bg-white/[0.05] text-gray-300 hover:bg-white/10"
          }`}
        >
          <Film className="h-4 w-4" />
          <span>Movies</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
            {movieCount}
          </span>
        </button>

        <button
          onClick={() => setFilter("tv")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
            filter === "tv"
              ? "border border-primaryM-500/40 bg-primaryM-500/20 text-primaryM-400"
              : "border border-white/10 bg-white/[0.05] text-gray-300 hover:bg-white/10"
          }`}
        >
          <Tv className="h-4 w-4" />
          <span>TV Shows</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
            {tvCount}
          </span>
        </button>
      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-12 text-center">
          <div className="mb-4 flex justify-center">
            {filter === "movie" ? (
              <Film className="h-12 w-12 text-gray-600" />
            ) : filter === "tv" ? (
              <Tv className="h-12 w-12 text-gray-600" />
            ) : (
              <Play className="h-12 w-12 text-gray-600" />
            )}
          </div>
          <p className="text-sm font-medium text-white">No media found</p>
          <p className="mt-1 text-xs text-gray-400">
            {filter === "movie"
              ? "You haven't logged any movies yet."
              : filter === "tv"
                ? "You haven't logged any TV shows yet."
                : "You haven't logged any media yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-3 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
          {filteredItems.map((item) => {
            const media = mediaMap?.[item.showId];

            if (!media) {
              return (
                <div
                  key={item.id}
                  className="flex aspect-[2/3] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center text-xs text-gray-300"
                >
                  Unable to load
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl transition-transform duration-200 hover:-translate-y-1"
              >
                <Link href={media.href} className="block">
                  <div className="relative aspect-[2/3]">
                    <LazyBlurImage
                      src={`https://image.tmdb.org/t/p/w500/${media.posterPath}`}
                      alt={`${media.title} poster`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      placeholderClassName="bg-zinc-700/50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <h3 className="line-clamp-2 text-sm font-semibold text-white">
                        {media.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-300">
                        <span>{media.year}</span>
                        <span>•</span>
                        <span>{media.mediaTypeLabel}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-gray-300">
                        <span className="flex items-center gap-1">
                          {item.watchType === "rewatch"
                            ? "Rewatch"
                            : "First watch"}
                        </span>
                        {item.rating !== null && (
                          <span className="flex items-center gap-1 text-primaryM-500">
                            <Star className="h-3 w-3 fill-current" />
                            {item.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
