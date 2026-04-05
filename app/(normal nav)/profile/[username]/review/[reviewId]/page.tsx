import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MessageSquareQuote, Star } from "lucide-react";

import LogTheMT from "@/components/MovieTv/buttons/logTheMT";
import { Button } from "@/components/ui/button";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import { ReplyForm } from "@/components/profile/replyForm";
import ReviewLikeButton from "@/components/profile/reviewLikeButton";
import {
  addReviewReply,
  getLoggedMoviesForUser,
  getReviewEngagement,
  getSpecifiedMovie,
  getSpecifiedTV,
  getUser,
  getUserDbProfileByUsername,
} from "@/lib/actions";

type LoggedMovieRow = Awaited<
  ReturnType<typeof getLoggedMoviesForUser>
>[number];

type ResolvedMedia = {
  id: string;
  title: string;
  posterPath: string | null;
  year: string;
  href: string;
};

async function resolveShowForLog(id: string): Promise<{
  media: ResolvedMedia | null;
  typeM: "movie" | "tv" | undefined;
  show: any;
}> {
  try {
    const movie = await getSpecifiedMovie(id);

    return {
      media: {
        id,
        title: movie.title ?? "Untitled",
        posterPath: movie.poster_path,
        year: movie.release_date?.slice(0, 4) ?? "----",
        href: `/movie/${id}`,
      },
      typeM: "movie",
      show: movie,
    };
  } catch {
    try {
      const tv = await getSpecifiedTV(id);

      return {
        media: {
          id,
          title: tv.name ?? "Untitled",
          posterPath: tv.poster_path,
          year: tv.first_air_date?.slice(0, 4) ?? "----",
          href: `/tv/${id}`,
        },
        typeM: "tv",
        show: tv,
      };
    } catch {
      return { media: null, typeM: undefined, show: null };
    }
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string; reviewId: string }>;
}) {
  const { username, reviewId } = await params;

  const viewer = await getUser();
  const profileUser = await getUserDbProfileByUsername(username);
  if (!profileUser) notFound();

  const isOwner = viewer?.id === profileUser.id;
  const logs = await getLoggedMoviesForUser(profileUser.id);
  const review = logs.find(
    (item) => item.id === reviewId && item.review.trim().length > 0,
  );

  if (!review) notFound();

  const [showInfo, engagement] = await Promise.all([
    resolveShowForLog(review.showId),
    getReviewEngagement(review.id),
  ]);
  const media = showInfo.media;

  async function replyReviewAction(formData: FormData) {
    "use server";

    if (!viewer?.id) throw new Error("You must be signed in to reply");

    const id = String(formData.get("reviewId") ?? "");
    const content = String(formData.get("replyContent") ?? "");
    if (!id || !content.trim()) return;

    const response = await addReviewReply(id, content);
    if (!response.ok) throw new Error(response.error ?? "Failed to add reply");

    revalidatePath(`/profile/${username}/review/${reviewId}`);
    revalidatePath(`/profile/${username}`);
  }

  return (
    <div className="container mt-6 pb-12 text-textMain">
      <div className="mx-auto max-w-4xl space-y-4">
        <div>
          <Link
            href={`/profile/${username}`}
            className="text-sm text-primaryM-500 hover:text-primaryM-400"
          >
            Back to @{username}
          </Link>
        </div>

        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex gap-4 sm:flex-col">
            <Link
              href={media?.href ?? "/explore"}
              className="relative block w-[160px] shrink-0 overflow-hidden rounded-xl sm:w-[120px]"
            >
              {media?.posterPath ? (
                <LazyBlurImage
                  src={`https://image.tmdb.org/t/p/w342/${media.posterPath}`}
                  alt={`${media.title} poster`}
                  className="h-full w-full object-cover"
                  placeholderClassName="bg-zinc-700/50"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center bg-white/[0.05] text-xs text-gray-400">
                  No poster
                </div>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gray-500">
                  <MessageSquareQuote className="h-3.5 w-3.5 text-primaryM-500" />
                  <span>Review</span>
                </div>
                {isOwner && showInfo.show ? (
                  <LogTheMT
                    show={showInfo.show}
                    typeM={showInfo.typeM}
                    userId={viewer?.id}
                    buttonLabel="Edit Review"
                    initialLog={{
                      id: review.id,
                      rating: review.rating ?? 0,
                      review: review.review ?? "",
                      watchedAt: review.watchedAt.toISOString(),
                      watchType: review.watchType,
                    }}
                  />
                ) : null}
              </div>
              <h1 className="mt-1 text-2xl font-semibold text-white sm:text-xl">
                {media?.title ?? "Title unavailable"}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                <span>
                  {review.watchType === "rewatch" ? "Rewatch" : "First watch"} •{" "}
                  {review.rating?.toFixed(1) ?? "0.0"}
                </span>
                <Star className="h-4 w-4 fill-primaryM-500 text-primaryM-500" />
              </p>
              {media ? (
                <p className="mt-1 text-xs text-gray-400">{media.year}</p>
              ) : null}

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-200">
                {review.review}
              </p>

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <span>
                  {engagement.likesCount} like
                  {engagement.likesCount === 1 ? "" : "s"}
                </span>
                <span>
                  {engagement.replies.length} repl
                  {engagement.replies.length === 1 ? "y" : "ies"}
                </span>
              </div>
            </div>
          </div>
        </article>

        {viewer?.id ? (
          <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <ReviewLikeButton
              reviewId={review.id}
              initialLiked={engagement.viewerLiked}
              mediaTitle={media?.title ?? "Title"}
              posterPath={media?.posterPath ?? null}
            />

            <ReplyForm
              reviewId={review.id}
              mediaTitle={media?.title ?? "Title"}
              posterPath={media?.posterPath ?? null}
              onSubmit={replyReviewAction}
            />
          </div>
        ) : null}

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm uppercase tracking-[0.22em] text-gray-400">
              Comments
            </h2>
            <span className="text-xs text-gray-500">
              {engagement.replies.length} reply
              {engagement.replies.length === 1 ? "" : "ies"}
            </span>
          </div>

          {engagement.replies.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">
              No comments yet. Be the first to reply.
            </p>
          ) : (
            <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {engagement.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-gray-200"
                >
                  <p className="text-xs text-gray-400">
                    @{reply.username ?? "user"}
                  </p>
                  <p className="mt-1 break-words">{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
