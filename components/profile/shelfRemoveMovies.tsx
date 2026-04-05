"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import { showProfileMovieToast } from "@/components/profile/profileToasts";
import { showErrorNotification } from "@/components/notificationSystem";

type SectionType = "favorites" | "likes" | "watchlist";

type MovieItem = {
  movieId: string;
  title: string;
  posterPath: string | null;
  year: string;
  mediaTypeLabel: "Movie" | "TV Show";
};

const sectionLabels: Record<SectionType, string> = {
  favorites: "Favorites",
  likes: "Movies I Like",
  watchlist: "Watchlist",
};

export default function ShelfRemoveMovies({
  section,
}: {
  section: SectionType;
}) {
  const [open, setOpen] = useState(false);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/profile/section-movies?section=${encodeURIComponent(section)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Could not load movies");
        }

        const json = (await response.json()) as MovieItem[];
        setMovies(Array.isArray(json) ? json : []);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Load failed";
        showErrorNotification("Load Error", message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [open, section]);

  const handleRemove = async (movieId: string) => {
    try {
      setRemovingId(movieId);
      const response = await fetch("/api/profile/section-remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, movieId }),
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(json.error ?? "Could not remove movie");
      }

      const removedItem = movies.find((m) => m.movieId === movieId);
      showProfileMovieToast({
        title: removedItem?.title ?? "Title",
        message: `Removed from ${sectionLabels[section]}`,
        posterPath: removedItem?.posterPath,
      });
      setMovies((prev) => prev.filter((m) => m.movieId !== movieId));
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Remove failed";
      showErrorNotification("Remove Error", message);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="h-8 border-white/20 bg-white/[0.04] px-3 text-xs text-white hover:bg-white/10"
        onClick={() => setOpen(!open)}
      >
        <Trash2 className="mr-1 h-3.5 w-3.5" />
        {open ? "Close" : "Remove"}
      </Button>

      {open ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
          {isLoading ? (
            <p className="text-xs text-gray-400">Loading movies...</p>
          ) : movies.length === 0 ? (
            <p className="text-xs text-gray-400">No movies in this section</p>
          ) : (
            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-2">
              {movies.map((movie) => (
                <div
                  key={movie.movieId}
                  className="relative overflow-hidden rounded-lg"
                >
                  <div className="relative aspect-[2/3]">
                    {movie.posterPath ? (
                      <LazyBlurImage
                        src={`https://image.tmdb.org/t/p/w342/${movie.posterPath}`}
                        alt={`${movie.title} poster`}
                        className="h-full w-full object-cover"
                        placeholderClassName="bg-zinc-700/50"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-white/[0.05] text-xs text-gray-400">
                        No poster
                      </div>
                    )}

                    <button
                      type="button"
                      aria-label={`Remove ${movie.title}`}
                      disabled={removingId === movie.movieId}
                      onClick={() => void handleRemove(movie.movieId)}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-red-400/50 bg-red-500/90 text-white shadow transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 truncate text-[10px] text-gray-300">
                    {movie.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
