"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ShareButton from "@/components/feed/ShareButton";

type FeedItem = any;
type SuggestedUser = {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  source: "friend" | "following";
};

export default function Page() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsAbortRef = useRef<AbortController | null>(null);

  const perPage = 10;

  const load = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const nextPage = reset ? 1 : page;
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("perPage", String(perPage));
      if (usernameFilter) params.set("user", usernameFilter);
      if (since) params.set("since", since);
      if (until) params.set("until", until);

      const res = await fetch(`/api/feed?${params.toString()}`);
      const json = await res.json();
      const fetched: FeedItem[] = json.items ?? [];

      if (reset) {
        setItems(fetched);
        setPage(2);
      } else {
        setItems((cur) => [...cur, ...fetched]);
        setPage((p) => p + 1);
      }

      setHasMore(fetched.length === perPage);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const query = usernameFilter.trim();

    if (suggestionsAbortRef.current) {
      suggestionsAbortRef.current.abort();
    }

    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    suggestionsAbortRef.current = controller;

    void (async () => {
      try {
        const params = new URLSearchParams({ q: query });
        const res = await fetch(`/api/feed/users?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const json = await res.json();
        if (!controller.signal.aborted) {
          setSuggestions(json.items ?? []);
          setShowSuggestions(true);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [usernameFilter]);

  const applyFilters = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setPage(1);
    setItems([]);
    setHasMore(true);
    setShowSuggestions(false);
    await load(true);
  };

  const chooseSuggestion = (user: SuggestedUser) => {
    const value = user.username ?? user.name ?? "";
    setUsernameFilter(value);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="container mt-6 pb-12 text-textMain">
      <h1 className="text-2xl font-semibold text-white">Activity Feed</h1>
      <p className="mt-2 text-sm text-gray-300">
        Recent activity from people you follow.
      </p>

      <form
        onSubmit={(e) => void applyFilters(e)}
        className="mt-4 flex flex-wrap items-end gap-3"
      >
        <div className="relative w-full max-w-md">
          <input
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              window.setTimeout(() => setShowSuggestions(false), 120);
            }}
            placeholder="Filter by username"
            className="w-full rounded-md bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-primaryM-500"
            autoComplete="off"
          />

          {showSuggestions && suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[rgba(13,12,15,0.98)] shadow-2xl shadow-black/40">
              {suggestions.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => chooseSuggestion(user)}
                  className="flex w-full items-center gap-3 border-b border-white/5 px-3 py-2 text-left transition last:border-b-0 hover:bg-white/[0.06]"
                >
                  <Avatar className="h-8 w-8">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.username ?? "user"} />
                    ) : (
                      <AvatarFallback>
                        {(user.username ?? "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      @{user.username ?? user.name ?? "unknown"}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {user.name ?? ""}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-300">
                    {user.source}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <span className="shrink-0">From</span>
          <input
            type="date"
            value={since}
            onChange={(e) => setSince(e.target.value)}
            title="Filter from date"
            className="rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-primaryM-500"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <span className="shrink-0">To</span>
          <input
            type="date"
            value={until}
            onChange={(e) => setUntil(e.target.value)}
            title="Filter until date"
            className="rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-primaryM-500"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primaryM-500 px-3 py-2 text-sm font-medium text-black transition-opacity hover:bg-primaryM-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Applying..." : "Apply"}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-gray-300">
            No recent activity. Follow people to see updates here.
          </div>
        ) : (
          items.map((item: FeedItem) => {
            const when = item.createdAt ?? item.watchedAt ?? new Date();
            const timeStr = when
              ? formatDistanceToNowStrict(new Date(when), { addSuffix: true })
              : "";

            return (
              <article
                key={item.id}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="shrink-0">
                  <Avatar className="h-10 w-10">
                    {item.username && item.image ? (
                      <AvatarImage
                        src={item.image}
                        alt={item.username ?? "user"}
                      />
                    ) : (
                      <AvatarFallback>
                        {(item.username ?? "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-white">
                          @{item.username ?? "unknown"}
                        </span>
                        <span className="ml-2 text-xs text-gray-300">
                          {item.type}
                        </span>
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-300">
                        {item.type === "watched" ||
                        item.type === "review_posted" ? (
                          <>
                            <span className="font-medium">
                              {item.resolvedTitle ?? "Title"}
                            </span>
                            {item.type === "review_posted" && item.message ? (
                              <span className="ml-2">— {item.message}</span>
                            ) : null}
                          </>
                        ) : item.type === "list_created" ? (
                          <>
                            <span className="font-medium">
                              {item.message ?? "List"}
                            </span>
                          </>
                        ) : item.type === "list_item_added" ? (
                          <>
                            <span className="font-medium">
                              {item.itemTitle ?? "Added an item"}
                            </span>
                            <span className="ml-2 text-xs text-gray-400">
                              to list
                            </span>
                          </>
                        ) : item.type === "list_liked" ? (
                          <span className="font-medium">Liked a list</span>
                        ) : item.type === "review_liked" ? (
                          <span className="font-medium">Liked a review</span>
                        ) : item.type === "review_replied" ? (
                          <span className="font-medium">
                            Replied: {item.message ?? ""}
                          </span>
                        ) : (
                          <span>{item.message}</span>
                        )}
                      </p>
                    </div>

                    <div className="ml-2 text-xs text-gray-400">
                      <time>{timeStr}</time>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="rounded-md bg-white/5 px-3 py-1 text-xs text-white hover:bg-white/10"
                      >
                        Open
                      </Link>
                    ) : null}

                    <ShareButton href={item.href ?? "/"} />
                  </div>
                </div>
              </article>
            );
          })
        )}

        <div className="pt-4 text-center">
          {hasMore ? (
            <button
              onClick={() => void load()}
              disabled={loading}
              className="rounded-md bg-primaryM-500 px-4 py-2 text-sm text-black"
            >
              {loading ? "Loading..." : "See more"}
            </button>
          ) : (
            <div className="text-sm text-gray-400">No more activity</div>
          )}
        </div>
      </div>
    </div>
  );
}
