import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { Metadata } from "next";

import LogTheMT from "@/components/MovieTv/buttons/logTheMT";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import {
  getLoggedMoviesForUser,
  getSpecifiedMovie,
  getSpecifiedTV,
  getUser,
  getUserDbProfileByUsername,
} from "@/lib/actions";
import { DEFAULT_OG_IMAGE, SITE_URL, SITE_NAME } from "@/config/site";
import { generatePageMetadata } from "@/lib/seo-utils";

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
      return {
        media: null,
        typeM: undefined,
        show: null,
      };
    }
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; logId: string }>;
}): Promise<Metadata> {
  const { username, logId } = await params;

  try {
    const profileUser = await getUserDbProfileByUsername(username);
    if (!profileUser) return { title: "Log Not Found" };

    const logs = await getLoggedMoviesForUser(profileUser.id);
    const log = logs.find((item) => item.id === logId);
    if (!log) return { title: "Log Not Found" };

    const showInfo = await resolveShowForLog(log.showId);
    const media = showInfo.media;

    if (!media) return { title: "Log Not Found" };

    const posterUrl = media.posterPath
      ? `https://image.tmdb.org/t/p/w1280${media.posterPath}`
      : DEFAULT_OG_IMAGE;

    const title = `${username} logged ${media.title}`;
    const description = `${username} watched ${media.title} on ${SITE_NAME}. Check out their activity and reviews.`;

    return generatePageMetadata({
      title,
      description,
      canonical: `${SITE_URL}/profile/${username}/log/${logId}`,
      ogImage: posterUrl,
      ogType: "article",
      authors: [username],
    });
  } catch (error) {
    return { title: "Log" };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string; logId: string }>;
}) {
  const { username, logId } = await params;

  const viewer = await getUser();
  const profileUser = await getUserDbProfileByUsername(username);
  if (!profileUser) notFound();

  const logs = await getLoggedMoviesForUser(profileUser.id);
  const log = logs.find((item) => item.id === logId);
  if (!log) notFound();

  const isOwner = viewer?.id === profileUser.id;
  const { media, typeM, show } = await resolveShowForLog(log.showId);

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

        <article className="rounded-2xl border border-white/10 bg-[rgba(13,12,15,0.9)] p-5">
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
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                  Log entry
                </p>
                {isOwner && show ? (
                  <LogTheMT
                    show={show}
                    typeM={typeM}
                    userId={viewer?.id}
                    buttonLabel="Edit Log"
                    initialLog={{
                      id: log.id,
                      rating: log.rating ?? 0,
                      review: log.review ?? "",
                      watchedAt: log.watchedAt.toISOString(),
                      watchType: log.watchType,
                    }}
                  />
                ) : null}
              </div>
              <h1 className="mt-1 text-2xl font-semibold text-white sm:text-xl">
                {media?.title ?? "Title unavailable"}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                <span>
                  {log.watchType === "rewatch" ? "Rewatch" : "First watch"} •{" "}
                  {log.rating?.toFixed(1) ?? "0.0"}
                </span>
                <Star className="h-4 w-4 fill-primaryM-500 text-primaryM-500" />
              </p>
              {media ? (
                <p className="mt-1 text-xs text-gray-400">{media.year}</p>
              ) : null}

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-200">
                {log.review?.trim().length ? (
                  log.review
                ) : (
                  <span className="italic text-white/35">
                    No written review
                  </span>
                )}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
