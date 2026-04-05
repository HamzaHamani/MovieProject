"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X, Search, Loader2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  showSuccessNotification,
  showErrorNotification,
} from "@/components/notificationSystem";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LazyBlurImage from "@/components/ui/lazyBlurImage";

interface BackdropImage {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
  vote_average: number;
}

interface BackdropSearchResult {
  id: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  year: string;
}

interface ProfileBackdropPickerProps {
  currentBackdropPath: string;
  username: string;
  bio: string | null;
  image: string | null;
}

export default function ProfileBackdropPicker({
  currentBackdropPath,
  username,
  bio,
  image,
}: ProfileBackdropPickerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BackdropSearchResult[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);

  // Two-step state: first select movie, then select backdrop
  const [selectedMovie, setSelectedMovie] =
    useState<BackdropSearchResult | null>(null);
  const [movieBackdrops, setMovieBackdrops] = useState<BackdropImage[]>([]);
  const [isLoadingBackdrops, setIsLoadingBackdrops] = useState(false);
  const [selectedBackdrop, setSelectedBackdrop] = useState(currentBackdropPath);
  const [isSaving, setIsSaving] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/search/tmdb?q=${encodeURIComponent(searchQuery)}`,
          {
            cache: "no-store",
          },
        );
        const data = (await response.json()) as BackdropSearchResult[];
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch backdrops for selected movie
  const handleSelectMovie = async (movie: BackdropSearchResult) => {
    setSelectedMovie(movie);
    setIsLoadingBackdrops(true);
    try {
      const response = await fetch(
        `/api/search/images?id=${movie.id}&type=${movie.mediaType}`,
      );
      const backdrops = (await response.json()) as BackdropImage[];
      setMovieBackdrops(backdrops);
    } catch (error) {
      console.error("Error fetching images:", error);
      showErrorNotification("Error", "Could not load images for this movie");
      setSelectedMovie(null);
    } finally {
      setIsLoadingBackdrops(false);
    }
  };

  const handleBackBackToSearch = () => {
    setSelectedMovie(null);
    setMovieBackdrops([]);
  };

  const handleSelectBackdrop = (filePath: string) => {
    setSelectedBackdrop(filePath);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!selectedBackdrop) {
        showErrorNotification("Error", "Please select a backdrop image");
        setIsSaving(false);
        return;
      }

      if (!username) {
        showErrorNotification("Error", "Could not get user information");
        setIsSaving(false);
        return;
      }

      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          bio,
          image,
          backdropPath: selectedBackdrop,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to update backdrop");
      }

      showSuccessNotification("Success", "Profile backdrop updated");
      setIsOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      // Refresh the page to reflect the new backdrop
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update backdrop";
      console.error("Backdrop update error:", error);
      showErrorNotification("Error", message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setSelectedBackdrop("");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedMovie(null);
    setMovieBackdrops([]);
  };

  const contentProps = {
    children: !selectedMovie ? (
      // Step 1: Search for movies - shown directly without wrapper
      <div className="space-y-4 rounded-2xl border border-white/10 bg-[rgba(10,10,14,0.82)] p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
            Select Backdrop
          </h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close backdrop picker"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-gray-500">
            Step 1: Search for a movie or TV show
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search movies or TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-white/15 bg-black/30 pl-10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-primaryM-400" />
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
              Search results
            </p>
            <div className="max-h-96 space-y-2 overflow-y-auto pr-2">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectMovie(result)}
                  className="group flex w-full gap-3 rounded-xl border border-white/10 p-3 text-left transition hover:border-primaryM-500/50 hover:bg-white/5"
                >
                  {result.posterPath ? (
                    <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-white/10">
                      <LazyBlurImage
                        src={`https://image.tmdb.org/t/p/w200${result.posterPath}`}
                        alt={result.title}
                        width={200}
                        height={300}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                      <p className="text-xs text-gray-500">No</p>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="line-clamp-2 text-sm font-medium text-white">
                      {result.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {result.year} •{" "}
                      {result.mediaType === "tv" ? "TV" : "Movie"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isSearching && searchResults.length === 0 && searchQuery.trim() && (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] py-12">
            <p className="text-sm text-gray-400">
              No results found. Try a different search.
            </p>
          </div>
        )}
      </div>
    ) : (
      // Step 2: Select backdrop from movie's images
      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-black/40 via-black/30 to-yellow-950/20 p-4 pt-11 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.9)]">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close backdrop picker"
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-semibold text-white">
                {selectedMovie.title}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Select a backdrop from available images
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackBackToSearch}
              className="text-gray-400 hover:bg-white/10 hover:text-white"
            >
              Back
            </Button>
          </div>

          {isLoadingBackdrops && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-primaryM-400" />
            </div>
          )}

          {!isLoadingBackdrops && movieBackdrops.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                Available backdrops
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {movieBackdrops.map((backdrop, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      handleSelectBackdrop(`${backdrop.file_path}`)
                    }
                    className={`group relative overflow-hidden rounded-2xl border text-left transition ${
                      selectedBackdrop === backdrop.file_path
                        ? "border-primaryM-500/70 ring-1 ring-primaryM-500/40"
                        : "border-white/10 hover:border-primaryM-500/50"
                    }`}
                  >
                    <div className="relative aspect-[16/9] bg-black/40">
                      <LazyBlurImage
                        src={`https://image.tmdb.org/t/p/w500${backdrop.file_path}`}
                        alt={`Backdrop ${idx + 1}`}
                        width={500}
                        height={281}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <p className="text-xs text-gray-300">
                          Backdrop {idx + 1}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isLoadingBackdrops && movieBackdrops.length === 0 && (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] py-12">
              <p className="text-sm text-gray-400">
                No backdrops available for this movie
              </p>
            </div>
          )}

          {selectedBackdrop && (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                Preview
              </p>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                <div className="relative aspect-[16/9]">
                  <LazyBlurImage
                    src={`https://image.tmdb.org/t/p/original${selectedBackdrop}`}
                    alt="Selected backdrop"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 border-t border-white/10 pt-4">
            {selectedBackdrop && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                className="flex-1 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                Clear
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !selectedBackdrop}
              className="flex-1 border border-primaryM-500/30 bg-primaryM-500/10 text-primaryM-400 hover:bg-primaryM-500/20 hover:text-primaryM-300 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Backdrop"
              )}
            </Button>
          </div>
        </div>
      </div>
    ),
  };

  if (isDesktop) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-gray-400 transition hover:border-primaryM-500/40 hover:bg-primaryM-500/10 hover:text-primaryM-400"
          title="Change profile backdrop"
        >
          <ImagePlus className="h-4 w-4" />
        </button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl border-0 bg-transparent shadow-none backdrop-blur-0 [&>button]:hidden">
            <div className="max-h-[70vh] overflow-y-auto">
              {contentProps.children}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-gray-400 transition hover:border-primaryM-500/40 hover:bg-primaryM-500/10 hover:text-primaryM-400"
        title="Change profile backdrop"
      >
        <ImagePlus className="h-4 w-4" />
      </button>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="border-0 bg-transparent">
          <div className="max-h-[70vh] overflow-y-auto px-4 pb-6">
            {contentProps.children}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
