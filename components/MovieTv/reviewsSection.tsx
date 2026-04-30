"use client";

import { useMemo, useState, useEffect } from "react";
import { stopInternalLoad } from "@/components/ui/loadingBus";
import Link from "next/link";
import { TReviewItem } from "@/lib/actions";

type Props = {
  items: TReviewItem[];
  mediaId: number;
  mediaType: "movie" | "tv";
};

export default function ReviewsSection({ items, mediaId, mediaType }: Props) {
  useEffect(() => {
    // notify that internal content has finished loading
    stopInternalLoad();
  }, []);
  const [category, setCategory] = useState<"social" | "critic">("social");

  const { socialReviews, criticReviews } = useMemo(() => {
    const social = items.filter(
      (review) =>
        review.source === "you" ||
        review.source === "friend" ||
        review.source === "following" ||
        review.source === "community",
    );

    const critic = items.filter(
      (review) => review.source === "tmdb" || !review.source,
    );

    return {
      socialReviews: social,
      criticReviews: critic,
    };
  }, [items]);

  const activeList =
    category === "social"
      ? socialReviews.slice(0, 6)
      : criticReviews.slice(0, 6);
  const hasSocial = socialReviews.length > 0;
  const hasCritic = criticReviews.length > 0;
  const hasAnyReviews = hasSocial || hasCritic;

  function getReviewText(review: TReviewItem) {
    return review.content.trim().length > 0
      ? review.content
      : "No written review";
  }

  return (
    <section className="mt-10">
      <h3 className="mb-5 text-3xl font-medium xl:text-2xl smd:text-xl">
        Reviews
      </h3>

      <div className="mb-5 border-b border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 text-sm text-gray-400">
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => setCategory("social")}
              className={`border-b-2 pb-1 transition ${
                category === "social"
                  ? "border-primaryM-500 text-white"
                  : "border-transparent hover:text-gray-200"
              }`}
            >
              Social Reviews ({socialReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setCategory("critic")}
              className={`border-b-2 pb-1 transition ${
                category === "critic"
                  ? "border-primaryM-500 text-white"
                  : "border-transparent hover:text-gray-200"
              }`}
            >
              Critic Reviews ({criticReviews.length})
            </button>
          </div>

          <Link
            href={`/reviews/${mediaType}/${mediaId}?category=${category}`}
            className="inline-flex rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 transition hover:bg-white/[0.08]"
          >
            See more
          </Link>
        </div>
      </div>

      {!hasAnyReviews ? (
        <div className="rounded-xl border border-white/10 bg-[#101018] p-4 text-sm text-gray-300">
          No reviews yet for this title.
        </div>
      ) : category === "social" && !hasSocial ? (
        <div className="rounded-xl border border-white/10 bg-[#101018] p-4 text-sm text-gray-300">
          No community reviews yet. Be the first to write one.
        </div>
      ) : category === "critic" && !hasCritic ? (
        <div className="rounded-xl border border-white/10 bg-[#101018] p-4 text-sm text-gray-300">
          No critic reviews available right now.
        </div>
      ) : (
        <div className="space-y-3">
          {activeList.map((review) => {
            const isLocalSocialReview =
              category === "social" &&
              Boolean(review.authorUsername) &&
              review.id.startsWith("local-");

            const content = (
              <>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <h4 className="line-clamp-1 text-sm font-semibold text-white">
                      {review.author}
                    </h4>
                    {category === "social" && review.source === "you" && (
                      <span className="shrink-0 rounded-full border border-primaryM-500/50 bg-primaryM-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primaryM-300">
                        You
                      </span>
                    )}
                    {category === "social" && review.source === "friend" && (
                      <span className="shrink-0 rounded-full border border-emerald-400/50 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-200">
                        Friend
                      </span>
                    )}
                    {category === "social" && review.source === "following" && (
                      <span className="shrink-0 rounded-full border border-sky-400/50 bg-sky-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-200">
                        Following
                      </span>
                    )}
                    {category === "social" && review.source === "community" && (
                      <span className="shrink-0 rounded-full border border-violet-400/50 bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-200">
                        Member
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>

                <p className="line-clamp-4 text-sm text-gray-300">
                  {getReviewText(review)}
                </p>

                {typeof review.author_details?.rating === "number" && (
                  <p className="mt-2 text-xs text-primaryM-400">
                    Rating: {review.author_details.rating}/10
                  </p>
                )}
              </>
            );

            return isLocalSocialReview ? (
              <Link
                key={review.id}
                href={`/profile/${review.authorUsername}/review/${review.id.replace(/^local-/, "")}`}
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
    </section>
  );
}
