import Link from "next/link";
import { notFound } from "next/navigation";

import {
  TReviewItem,
  getCategorizedReviewsByType,
  getSpecifiedMovie,
  getSpecifiedTV,
} from "@/lib/actions";
import AutoLoadMoreLink from "@/components/general/autoLoadMoreLink";

type Props = {
  params: Promise<{ typeM: string; id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

function parsePositiveInt(value: string | string[] | undefined, fallback = 1) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function sourceBadge(review: TReviewItem) {
  if (review.source === "you") {
    return "You";
  }

  if (review.source === "friend") {
    return "Friend";
  }

  if (review.source === "following") {
    return "Following";
  }

  return null;
}

function socialReviewHref(review: TReviewItem) {
  if (
    review.source === "you" ||
    review.source === "friend" ||
    review.source === "following"
  ) {
    if (review.authorUsername && review.id.startsWith("local-")) {
      return `/profile/${review.authorUsername}/review/${review.id.replace(/^local-/, "")}`;
    }
  }

  return null;
}

function reviewText(review: TReviewItem) {
  return review.content.trim().length > 0
    ? review.content
    : "No written review";
}

export default async function ReviewsPage({ params, searchParams }: Props) {
  const { typeM, id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (typeM !== "movie" && typeM !== "tv") {
    notFound();
  }

  const categoryValue = Array.isArray(resolvedSearchParams?.category)
    ? resolvedSearchParams?.category[0]
    : resolvedSearchParams?.category;
  const activeCategory =
    categoryValue === "critic" || categoryValue === "social"
      ? categoryValue
      : "social";

  const socialPage = parsePositiveInt(resolvedSearchParams?.socialPage, 1);
  const criticPage = parsePositiveInt(resolvedSearchParams?.criticPage, 1);

  const [title, socialFeed, criticFeed] = await Promise.all([
    typeM === "movie"
      ? getSpecifiedMovie(id).then((movie) => movie.title ?? "Title")
      : getSpecifiedTV(id).then((tv) => tv.name ?? "Title"),
    getCategorizedReviewsByType({
      id,
      typeM,
      category: "social",
      page: socialPage,
      pageSize: 10,
    }),
    getCategorizedReviewsByType({
      id,
      typeM,
      category: "critic",
      page: criticPage,
      pageSize: 10,
    }),
  ]);

  const backHref = `/${typeM}/${id}?tab=reviews`;

  const currentItems =
    activeCategory === "social" ? socialFeed.items : criticFeed.items;
  const hasMore =
    activeCategory === "social" ? socialFeed.hasMore : criticFeed.hasMore;

  const seeMoreHref =
    activeCategory === "social"
      ? `/reviews/${typeM}/${id}?category=social&socialPage=${socialPage + 1}&criticPage=${criticPage}`
      : `/reviews/${typeM}/${id}?category=critic&socialPage=${socialPage}&criticPage=${criticPage + 1}`;

  return (
    <div className="container pb-12 pt-8 text-textMain">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
            {typeM === "movie" ? "Movie" : "TV Show"} Reviews
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white lg:text-2xl sm:text-xl">
            {title}
          </h1>
        </div>

        <Link
          href={backHref}
          className="rounded-lg border border-white/20 bg-white/[0.03] px-3 py-2 text-sm text-white transition hover:bg-white/[0.08]"
        >
          Back to title
        </Link>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 lg:p-4 sm:p-3">
        <div className="mb-5 border-b border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 text-sm text-gray-400">
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href={`/reviews/${typeM}/${id}?category=social&socialPage=${socialPage}&criticPage=${criticPage}`}
                className={`border-b-2 pb-1 transition ${
                  activeCategory === "social"
                    ? "border-primaryM-500 text-white"
                    : "border-transparent hover:text-gray-200"
                }`}
              >
                Social Reviews ({socialFeed.items.length})
              </Link>

              <Link
                href={`/reviews/${typeM}/${id}?category=critic&socialPage=${socialPage}&criticPage=${criticPage}`}
                className={`border-b-2 pb-1 transition ${
                  activeCategory === "critic"
                    ? "border-primaryM-500 text-white"
                    : "border-transparent hover:text-gray-200"
                }`}
              >
                Critic Reviews ({criticFeed.items.length})
              </Link>
            </div>

            {hasMore ? (
              <Link
                href={seeMoreHref}
                className="inline-flex rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 transition hover:bg-white/[0.08]"
              >
                See more
              </Link>
            ) : null}
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#101018] p-4 text-sm text-gray-300">
            {activeCategory === "social"
              ? "No social reviews yet for this title."
              : "No critic reviews available for this title."}
          </div>
        ) : (
          <div className="space-y-3">
            {currentItems.map((review) => {
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

                  <p className="text-sm text-gray-300">{reviewText(review)}</p>

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

            {hasMore ? (
              <div className="flex justify-end pt-1">
                <Link
                  href={seeMoreHref}
                  className="inline-flex rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 transition hover:bg-white/[0.08]"
                >
                  See more reviews
                </Link>
              </div>
            ) : null}

            <AutoLoadMoreLink href={seeMoreHref} enabled={hasMore} />
          </div>
        )}
      </section>
    </div>
  );
}
