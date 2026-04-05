"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showProfileMovieToast } from "@/components/profile/profileToasts";
import { showErrorNotification } from "@/components/notificationSystem";

type SectionType = "favorites" | "likes" | "watchlist";

type SearchResultItem = {
  id: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  year: string;
};

const sectionLabels: Record<SectionType, string> = {
  favorites: "Favorites",
  likes: "Movies I Like",
  watchlist: "Watchlist",
};

export default function ShelfAddMovies({ section }: { section: SectionType }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(
          `/api/search/tmdb?q=${encodeURIComponent(trimmed)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const json = (await response.json()) as SearchResultItem[];
        setResults(Array.isArray(json) ? json : []);
      } catch {
        if (!controller.signal.aborted) {
          showErrorNotification("Search Error", "Could not search right now");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  const handleAdd = async (item: SearchResultItem) => {
    try {
      setAddingId(item.id);
      const response = await fetch("/api/profile/section-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, movieId: item.id }),
      });

      const json = (await response.json()) as {
        already?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error ?? "Could not add movie");
      }

      if (json.already) {
        showProfileMovieToast({
          title: item.title,
          message: `Already in ${sectionLabels[section]}`,
          posterPath: item.posterPath,
        });
      } else {
        showProfileMovieToast({
          title: item.title,
          message: `Added to ${sectionLabels[section]}`,
          posterPath: item.posterPath,
        });
      }

      setOpen(false);
      setQuery("");
      setResults([]);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Add failed";
      showErrorNotification("Add Error", message);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="h-8 border-white/20 bg-white/[0.04] px-3 text-xs text-white hover:bg-white/10"
        onClick={() => {
          setOpen((value) => {
            const next = !value;
            if (!next) {
              setQuery("");
              setResults([]);
            }
            return next;
          });
        }}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        {open ? "Close" : "Add movies"}
      </Button>

      {open ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search movies or TV..."
              className="h-9 border-white/15 bg-white/5 pl-8 text-sm text-white"
            />
          </div>

          <p className="mt-2 text-[11px] text-gray-400">
            Search starts automatically 1 second after you stop typing.
          </p>

          <div className="hide-scrollbar mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
            {isSearching ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-gray-300">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-3 text-xs text-gray-300">
                Type at least 2 characters to see results.
              </div>
            ) : (
              results.map((item) => (
                <div
                  key={`${item.mediaType}-${item.id}`}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-2"
                >
                  <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-white/10">
                    {item.posterPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185/${item.posterPath}`}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.year} • {item.mediaType === "tv" ? "TV" : "Movie"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    disabled={addingId === item.id}
                    className="h-8 bg-primaryM-500 px-2 text-xs text-black hover:bg-primaryM-600"
                    onClick={() => void handleAdd(item)}
                  >
                    {addingId === item.id ? "..." : "Add"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
