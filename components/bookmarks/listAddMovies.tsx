"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

import { showErrorNotification } from "@/components/notificationSystem";
import { showProfileMovieToast } from "@/components/profile/profileToasts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";

type SearchResultItem = {
  id: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  year: string;
};

export default function ListAddMovies({
  bookmarkId,
  listName,
}: {
  bookmarkId: string;
  listName: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  const handleAdd = async (item: SearchResultItem) => {
    try {
      setAddingId(item.id);
      const response = await fetch("/api/bookmarks/list-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookmarkId,
          movieId: item.id,
          mediaType: item.mediaType,
        }),
      });

      const json = (await response.json()) as {
        already?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error ?? "Could not add movie");
      }

      showProfileMovieToast({
        title: item.title,
        message: json.already
          ? `Already in ${listName}`
          : `Added to ${listName}`,
        posterPath: item.posterPath,
      });

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

  const panelContent = (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search to add in ${listName}...`}
          className="h-9 border-white/15 bg-white/5 pl-8 text-sm text-white"
        />
      </div>

      <p className="mt-2 text-[11px] text-gray-400">
        Search starts automatically 0.5s after you stop typing.
      </p>

      <div className="hide-scrollbar mt-3 max-h-[55vh] space-y-2 overflow-y-auto overflow-x-hidden pr-1">
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
              className="grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-2"
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
              <div className="w-full min-w-0 text-left">
                <p className="block w-full truncate pr-2 text-left text-sm font-medium text-white">
                  {item.title}
                </p>
                <p className="text-left text-xs text-gray-400">
                  {item.year} • {item.mediaType === "tv" ? "TV" : "Movie"}
                </p>
              </div>
              <Button
                type="button"
                disabled={addingId === item.id}
                className="h-8 shrink-0 self-center justify-self-end bg-primaryM-500 px-2 text-xs text-black hover:bg-primaryM-600"
                onClick={() => void handleAdd(item)}
              >
                {addingId === item.id ? "..." : "Add"}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-8 border-white/20 bg-white/[0.04] px-3 text-xs text-white hover:bg-white/10"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add movies
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[88svh] w-[min(760px,94vw)] overflow-y-auto p-5">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-white">Add movies</DialogTitle>
            <DialogDescription className="text-gray-300">
              Find a movie or TV show and add it to this list.
            </DialogDescription>
          </DialogHeader>
          {panelContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-8 border-white/20 bg-white/[0.04] px-3 text-xs text-white hover:bg-white/10"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add movies
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[88svh] overflow-hidden px-4">
        <DrawerHeader className="px-0 pb-2 pt-2 text-left">
          <DrawerTitle className="text-white">Add movies</DrawerTitle>
          <DrawerDescription className="text-gray-300">
            Find a movie or TV show and add it to this list.
          </DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {panelContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
