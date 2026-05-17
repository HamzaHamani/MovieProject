"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, Search, X, Film } from "lucide-react";

import { showProfileMovieToast } from "@/components/profile/profileToasts";
import { showErrorNotification } from "@/components/notificationSystem";
import { useMediaQuery } from "@/hooks/use-media-query";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Portal Modal (desktop) ───────────────────────────────────────────────────

function CustomModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!visible && mounted && !open) {
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [visible, mounted, open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: visible ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(10px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(10px)" : "blur(0px)",
        transition: "background 0.22s ease, backdrop-filter 0.22s ease",
      }}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[500px] overflow-hidden rounded-2xl border border-white/10 bg-backgroundM"
        style={{
          maxHeight: "88svh",
          scrollbarWidth: "none",
          opacity: visible ? 1 : 0,
          transform: visible
            ? "scale(1) translateY(0)"
            : "scale(0.96) translateY(10px)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

// ─── Bottom Sheet (mobile) ────────────────────────────────────────────────────

function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!visible && mounted && !open) {
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [visible, mounted, open]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{
        background: visible ? "backgroundM" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(10px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(10px)" : "blur(0px)",
        transition: "background 0.26s ease, backdrop-filter 0.26s ease",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full overflow-hidden rounded-t-2xl border-t border-white/10 bg-backgroundM"
        style={{
          maxHeight: "88svh",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.26s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* drag handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

// ─── Trigger Button ───────────────────────────────────────────────────────────

function TriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 active:scale-[0.97]"
    >
      <Plus className="h-3.5 w-3.5" />
      Add movies
    </button>
  );
}

// ─── Search result row ────────────────────────────────────────────────────────

function MovieRow({
  item,
  isAdding,
  onAdd,
}: {
  item: SearchResultItem;
  isAdding: boolean;
  onAdd: (item: SearchResultItem) => void;
}) {
  return (
    <div
      className="grid items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 transition-colors hover:bg-white/[0.06]"
      style={{ gridTemplateColumns: "56px minmax(0,1fr) auto" }}
    >
      {/* Poster — 40% larger: w-14 (56px) × h-20 (80px) */}
      <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white/10">
        {item.posterPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w185/${item.posterPath}`}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film className="h-5 w-5 text-white/20" />
          </div>
        )}
      </div>

      {/* Meta — left-aligned, vertically centered */}
      <div className="flex min-w-0 flex-col items-start justify-center gap-0.5">
        <p className="truncate pr-1 text-left text-sm font-medium text-white">
          {item.title}
        </p>
        <p className="text-left text-xs text-white/40">
          {item.year} · {item.mediaType === "tv" ? "TV" : "Movie"}
        </p>
      </div>

      {/* Add button */}
      <button
        type="button"
        disabled={isAdding}
        onClick={() => onAdd(item)}
        className="flex-shrink-0 self-center rounded-lg px-3 py-1.5 text-xs font-semibold text-black transition hover:opacity-90 active:scale-95 disabled:opacity-50"
        style={{ background: "#c9a227" }}
      >
        {isAdding ? (
          <svg
            className="mx-auto animate-spin"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <circle
              cx="7"
              cy="7"
              r="5.5"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="1.8"
            />
            <path
              d="M7 1.5A5.5 5.5 0 0 1 12.5 7"
              stroke="#1a1100"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          "Add"
        )}
      </button>
    </div>
  );
}

// ─── Modal body (shared between desktop + mobile) ─────────────────────────────

function AddMoviesContent({
  section,
  onClose,
}: {
  section: SectionType;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  // Debounced search
  useEffect(() => {
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
          { signal: controller.signal, cache: "no-store" },
        );
        if (!response.ok) throw new Error("Search failed");
        const json = (await response.json()) as SearchResultItem[];
        setResults(Array.isArray(json) ? json : []);
      } catch {
        if (!controller.signal.aborted) {
          showErrorNotification("Search Error", "Could not search right now");
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleAdd = useCallback(
    async (item: SearchResultItem) => {
      try {
        setAddingId(item.id);
        const response = await fetch("/api/profile/section-add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section,
            movieId: item.id,
            mediaType: item.mediaType,
          }),
        });

        const json = (await response.json()) as {
          already?: boolean;
          error?: string;
        };

        if (!response.ok) throw new Error(json.error ?? "Could not add movie");

        showProfileMovieToast({
          title: item.title,
          message: json.already
            ? `Already in ${sectionLabels[section]}`
            : `Added to ${sectionLabels[section]}`,
          posterPath: item.posterPath,
        });

        onClose();
        setQuery("");
        setResults([]);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Add failed";
        showErrorNotification("Add Error", message);
      } finally {
        setAddingId(null);
      }
    },
    [section, onClose, router],
  );

  const showPlaceholder = query.trim().length < 2;

  return (
    <div className="flex flex-col" style={{ maxHeight: "88svh" }}>
      {/* ── Header ── */}
      <div className="px-6 pb-4 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="mb-3 inline-block rounded-full bg-[#c9a227] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
          Add Movies
        </span>
        <h2 className="text-xl font-medium text-white">Find a movie or show</h2>
        <p className="mt-1 text-sm text-white/40">
          Search and add it to{" "}
          <span className="text-white/60">{sectionLabels[section]}</span>.
        </p>
        <div className="mt-5 h-px w-full bg-white/10" />
      </div>

      {/* ── Search input ── */}
      <div className="px-6 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies or TV..."
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c9a227]/60 focus:bg-white/[0.07]"
          />
        </div>
        <p className="mt-2 text-[11px] text-white/25">
          Search starts automatically 0.5s after you stop typing.
        </p>
      </div>

      {/* ── Results ── */}
      <div
        className="min-h-0 flex-1 overflow-y-auto px-6 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {isSearching ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5">
            <svg
              className="animate-spin text-[#c9a227]"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="rgba(201,162,39,0.2)"
                strokeWidth="2"
              />
              <path
                d="M8 2a6 6 0 0 1 6 6"
                stroke="#c9a227"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-sm text-white/40">Searching…</span>
          </div>
        ) : showPlaceholder ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
            <Film className="mx-auto mb-3 h-8 w-8 text-white/15" />
            <p className="text-sm text-white/30">
              Type at least 2 characters to see results.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
            <p className="text-sm text-white/30">
              No results for &ldquo;{query.trim()}&rdquo;
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {results.map((item) => (
              <MovieRow
                key={`${item.mediaType}-${item.id}`}
                item={item}
                isAdding={addingId === item.id}
                onAdd={handleAdd}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="sticky bottom-0 flex gap-2.5 border-t border-white/10 bg-backgroundM px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-white/50 transition hover:bg-white/[0.08] hover:text-white/70"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled
          className="flex flex-[2] cursor-default items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-black/40 opacity-50"
          style={{ background: "#c9a227" }}
          aria-hidden
        >
          <Search className="h-4 w-4" />
          Search &amp; add above
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ShelfAddMovies({ section }: { section: SectionType }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const content = (
    <AddMoviesContent section={section} onClose={() => setOpen(false)} />
  );

  if (isDesktop) {
    return (
      <>
        <TriggerButton onClick={() => setOpen(true)} />
        <CustomModal open={open} onClose={() => setOpen(false)}>
          {content}
        </CustomModal>
      </>
    );
  }

  return (
    <>
      <TriggerButton onClick={() => setOpen(true)} />
      <BottomSheet open={open} onClose={() => setOpen(false)}>
        {content}
      </BottomSheet>
    </>
  );
}
