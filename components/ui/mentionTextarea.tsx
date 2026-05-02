"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import LazyBlurImage from "@/components/ui/lazyBlurImage";
import { cn } from "@/lib/utils";
import type { TsearchApiResponse } from "@/types/api";

type MentionSuggestion = {
  id: string;
  kind: "user" | "person";
  title: string;
  subtitle?: string;
  username?: string;
  imagePath: string | null;
  insertText: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
  name?: string;
};

type ActiveMention = {
  start: number;
  end: number;
  query: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getActiveMention(value: string, caret: number): ActiveMention | null {
  const textUntilCaret = value.slice(0, caret);
  const atIndex = textUntilCaret.lastIndexOf("@");

  if (atIndex < 0) return null;

  const previousChar = atIndex > 0 ? textUntilCaret[atIndex - 1] : "";
  if (previousChar && /[^\s([{"'`]/.test(previousChar)) {
    return null;
  }

  const query = textUntilCaret.slice(atIndex + 1);
  if (/\s/.test(query)) return null;

  return {
    start: atIndex,
    end: caret,
    query,
  };
}

export default function MentionTextarea({
  value,
  onChange,
  placeholder,
  className,
  maxLength,
  rows = 4,
  disabled,
  name,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeMention, setActiveMention] = useState<ActiveMention | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const mentionQuery = activeMention?.query ?? "";

  const normalizedQuery = useMemo(() => mentionQuery.trim(), [mentionQuery]);

  useEffect(() => {
    if (!isOpen || normalizedQuery.length < 1) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(normalizedQuery)}&type=person&page=1`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Mention search failed");
        }

        const data = (await response.json()) as TsearchApiResponse;
        const mapped = data.results
          .filter(
            (result) => result.kind === "user" || result.kind === "person",
          )
          .slice(0, 8)
          .map((result) => {
            if (result.kind === "user") {
              const username = result.username ?? slugify(result.title);
              return {
                id: result.id,
                kind: "user" as const,
                title: result.title,
                subtitle: result.bio || result.subtitle,
                username: result.username,
                imagePath: result.imagePath,
                insertText: `@${username}`,
              };
            }

            const slug = slugify(result.title) || "person";
            return {
              id: result.id,
              kind: "person" as const,
              title: result.title,
              subtitle: result.subtitle,
              imagePath: result.imagePath,
              insertText: `@${slug}-${result.id}`,
            };
          });

        setSuggestions(mapped);
        setActiveIndex(0);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, normalizedQuery]);

  const applySuggestion = (suggestion: MentionSuggestion) => {
    if (!activeMention) return;

    const next =
      value.slice(0, activeMention.start) +
      suggestion.insertText +
      " " +
      value.slice(activeMention.end);

    onChange(next);
    setIsOpen(false);

    requestAnimationFrame(() => {
      const nextCaret = activeMention.start + suggestion.insertText.length + 1;
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        name={name}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          const caret = event.target.selectionStart ?? nextValue.length;

          onChange(nextValue);

          const mention = getActiveMention(nextValue, caret);
          setActiveMention(mention);
          setIsOpen(Boolean(mention));
        }}
        onClick={(event) => {
          const caret = event.currentTarget.selectionStart ?? value.length;
          const mention = getActiveMention(value, caret);
          setActiveMention(mention);
          setIsOpen(Boolean(mention));
        }}
        onKeyDown={(event) => {
          if (!isOpen || suggestions.length === 0) return;

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) =>
              current >= suggestions.length - 1 ? 0 : current + 1,
            );
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) =>
              current <= 0 ? suggestions.length - 1 : current - 1,
            );
            return;
          }

          if (event.key === "Enter") {
            event.preventDefault();
            const suggestion = suggestions[activeIndex];
            if (suggestion) {
              applySuggestion(suggestion);
            }
            return;
          }

          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        onBlur={() => {
          setTimeout(() => setIsOpen(false), 120);
        }}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          "shadow-xs flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base outline-none transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "border-white/15 bg-black/30 text-white placeholder:text-gray-500",
          className,
        )}
      />

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-y-auto rounded-xl border border-white/15 bg-[rgba(13,12,15,0.95)] p-1 shadow-2xl backdrop-blur">
          {isLoading ? (
            <p className="px-3 py-2 text-xs text-gray-400">Searching...</p>
          ) : suggestions.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400">
              No matching profiles or cast found.
            </p>
          ) : (
            suggestions.map((suggestion, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={`${suggestion.kind}-${suggestion.id}-${index}`}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    applySuggestion(suggestion);
                  }}
                  className={cn(
                    "grid w-full grid-cols-[34px_minmax(0,1fr)] items-start gap-2 rounded-lg px-2 py-1.5 text-left",
                    isActive ? "bg-white/10" : "hover:bg-white/5",
                  )}
                >
                  {suggestion.imagePath ? (
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10">
                      <LazyBlurImage
                        src={
                          suggestion.kind === "person"
                            ? `https://image.tmdb.org/t/p/w185${suggestion.imagePath}`
                            : suggestion.imagePath
                        }
                        alt={suggestion.title}
                        className="h-full w-full object-cover"
                        placeholderClassName="bg-zinc-800/70"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] text-gray-300">
                      {suggestion.title.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="flex w-full min-w-0 flex-col items-start justify-start text-left">
                    <p className="line-clamp-1 w-full text-left text-xs font-medium text-white">
                      {suggestion.title}
                    </p>
                    <p className="line-clamp-1 w-full text-left text-[11px] text-gray-400">
                      {suggestion.kind === "user"
                        ? suggestion.username
                          ? `@${suggestion.username}`
                          : "Community profile"
                        : suggestion.subtitle || "Cast or crew"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
