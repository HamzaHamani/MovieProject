"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TReviewItem } from "@/lib/actions";
import MentionText from "@/components/general/mentionText";

type ReviewFeed = {
  items: TReviewItem[];
  hasMore: boolean;
};

type Props = {
  typeM: "movie" | "tv";
  id: string;
  socialFeed: ReviewFeed;
  criticFeed: ReviewFeed;
  initialCategory: "social" | "critic";
  socialPage: number;
  criticPage: number;
};

function sourceBadge(review: TReviewItem) {
  if (review.source === "you") return "You";
  if (review.source === "friend") return "Friend";
  if (review.source === "following") return "Following";
  return null;
}

function socialReviewHref(review: TReviewItem) {
  if (
    (review.source === "you" ||
      review.source === "friend" ||
      review.source === "following") &&
    review.authorUsername &&
    review.id.startsWith("local-")
  ) {
    return `/profile/${review.authorUsername}/review/${review.id.replace(/^local-/, "")}`;
  }

  return null;
}

function reviewText(review: TReviewItem) {
  return review.content.trim().length > 0
    ? review.content
    : "No written review";
}

export default function ReviewsTabs({
  typeM,
  id,
  socialFeed,
  criticFeed,
  initialCategory,
  socialPage,
  criticPage,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<"social" | "critic">(
    initialCategory,
  );

  const tabButtonRefs = useRef<
    Record<"social" | "critic", HTMLButtonElement | null>
  >({
    social: null,
    critic: null,
  });
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const currentFeed = activeCategory === "social" ? socialFeed : criticFeed;

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const activeButton = tabButtonRefs.current[activeCategory];

      if (!activeButton) {
        setIndicatorStyle((current) => ({ ...current, opacity: 0 }));
        return;
      }

      setIndicatorStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
        opacity: 1,
      });
    };

    updateIndicator();

    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeCategory, socialFeed.items.length, criticFeed.items.length]);

  const seeMoreHref =
    activeCategory === "social"
      ? `/reviews/${typeM}/${id}?category=social&socialPage=${socialPage + 1}&criticPage=${criticPage}`
      : `/reviews/${typeM}/${id}?category=critic&socialPage=${socialPage}&criticPage=${criticPage + 1}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2 text-sm text-gray-400">
        <div className="relative flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 left-0 rounded-full bg-primaryM-500 shadow-[0_0_0_1px_rgba(245,158,11,0.25)] transition-[transform,width,opacity] duration-300 ease-out"
            style={{
              transform: `translateX(${indicatorStyle.left}px)`,
              width: indicatorStyle.width,
              opacity: indicatorStyle.opacity,
            }}
          />
          <button
            type="button"
            onClick={() => setActiveCategory("social")}
            ref={(element) => {
              tabButtonRefs.current.social = element;
            }}
            className={`relative z-10 rounded-full px-4 py-2 text-sm transition ${
              activeCategory === "social"
                ? "text-black"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Social Reviews ({socialFeed.items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("critic")}
            ref={(element) => {
              tabButtonRefs.current.critic = element;
            }}
            className={`relative z-10 rounded-full px-4 py-2 text-sm transition ${
              activeCategory === "critic"
                ? "text-black"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Critic Reviews ({criticFeed.items.length})
          </button>
        </div>
      </div>

      {currentFeed.items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#101018] p-4 text-sm text-gray-300">
          {activeCategory === "social"
            ? "No social reviews yet for this title."
            : "No critic reviews available for this title."}
        </div>
      ) : (
        <div className="space-y-3">
          {currentFeed.items.map((review) => {
            const badge = sourceBadge(review);
            const href = socialReviewHref(review);

            const content = (
              <>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <h4 className="line-clamp-1 text-sm font-semibold text-white">
                      {review.author}
                    </h4>
                    {badge ? (
                      <span className="shrink-0 rounded-full border border-primaryM-500/50 bg-primaryM-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primaryM-300">
                        {badge}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-sm text-gray-300">
                  <MentionText
                    text={reviewText(review)}
                    disableLinks={Boolean(href)}
                  />
                </p>

                {typeof review.author_details?.rating === "number" && (
                  <p className="mt-2 text-xs text-primaryM-400">
                    Rating: {review.author_details.rating}/10
                  </p>
                )}
              </>
            );

            return href ? (
              <Link
                key={review.id}
                href={href}
                className="block rounded-xl border border-white/10 bg-[#101018] p-4 transition hover:border-primaryM-500/50 hover:bg-[#141420]"
              >
                {content}
              </Link>
            ) : (
              <article
                key={review.id}
                className="rounded-xl border border-white/10 bg-[#101018] p-4"
              >
                {content}
              </article>
            );
          })}
        </div>
      )}

      {currentFeed.hasMore ? (
        <div className="flex justify-center pt-1">
          <Button
            asChild
            variant="outline"
            className="h-9 rounded-full border-white/15 bg-white/[0.03] px-4 text-sm text-gray-200 hover:bg-white/[0.08] hover:text-white"
          >
            <Link href={seeMoreHref}>
              Show more {activeCategory} reviews
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
