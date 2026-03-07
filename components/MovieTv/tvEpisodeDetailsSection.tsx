"use client";

import { TTvEpisodeDetails } from "@/lib/actions";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import { GrDocumentMissing } from "react-icons/gr";
import Link from "next/link";
import { useState } from "react";

type Props = {
  tvId: number;
  seasonNumber: number;
  episode: TTvEpisodeDetails;
};

export default function TvEpisodeDetailsSection({
  tvId,
  seasonNumber,
  episode,
}: Props) {
  const allCrew = episode.crew;
  const allGuestStars = episode.guest_stars;
  const [showAllCrew, setShowAllCrew] = useState(false);
  const [showAllGuestStars, setShowAllGuestStars] = useState(false);

  const visibleCrew = showAllCrew ? allCrew : allCrew.slice(0, 12);
  const visibleGuestStars = showAllGuestStars
    ? allGuestStars
    : allGuestStars.slice(0, 12);

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-3xl font-medium xl:text-2xl smd:text-xl">
          {`Seasons / Episodes / Episode ${episode.episode_number}`}
        </h3>
        <Link
          href={`/tv/${tvId}?tab=seasons&season=${seasonNumber}`}
          scroll={false}
          className="text-sm font-medium text-primaryM-500 underline underline-offset-4 transition hover:text-primaryM-400"
        >
          Back to episodes
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-4 xl:grid-cols-1">
        <article className="col-span-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#101018] xl:col-span-1">
          <div className="relative h-[420px] w-full overflow-hidden xl:h-[360px] lg:h-[320px] smd:h-[280px]">
            {episode.still_path ? (
              <LazyBlurImage
                src={`https://image.tmdb.org/t/p/w780${episode.still_path}`}
                alt={episode.name}
                className="h-full w-full object-cover"
                placeholderClassName="bg-zinc-700/50"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-700">
                <GrDocumentMissing className="text-4xl smd:text-3xl" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#14131b] via-[#14131b]/40 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-sm font-medium text-gray-200">
                Episode still
              </p>
              <p className="text-xs text-gray-400">S{seasonNumber} E{episode.episode_number}</p>
            </div>
          </div>
        </article>

        <article className="col-span-3 rounded-xl border border-white/10 bg-[#101018] p-4 xl:col-span-1">
          <h4 className="mb-2 text-xl font-semibold">{episode.name}</h4>

          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-300">
            <span className="rounded border border-white/20 px-2 py-1">
              Air: {episode.air_date ?? "Unknown"}
            </span>
            <span className="rounded border border-white/20 px-2 py-1">
              Runtime: {episode.runtime ? `${episode.runtime} min` : "--"}
            </span>
            <span className="rounded border border-white/20 px-2 py-1">
              Vote: {episode.vote_average.toFixed(1)} ({episode.vote_count})
            </span>
          </div>

          <p className="mb-5 text-sm text-gray-300">
            {episode.overview || "No overview available for this episode."}
          </p>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h5 className="text-sm font-semibold text-white">Crew</h5>
              {allCrew.length > 12 && !showAllCrew && (
                <button
                  type="button"
                  onClick={() => setShowAllCrew(true)}
                  className="text-xs font-medium text-primaryM-500 underline underline-offset-4 transition hover:text-primaryM-400"
                >
                  Show all ({allCrew.length})
                </button>
              )}
            </div>
            {allCrew.length === 0 ? (
              <p className="text-xs text-gray-400">No crew details available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {visibleCrew.map((person) => (
                  <Link
                    key={`crew-${person.id}-${person.job ?? person.department ?? ""}`}
                    href={`/crew/${person.id}`}
                    className="rounded border border-white/15 px-2 py-1 text-xs text-gray-200 transition-colors hover:border-primaryM-500/60 hover:text-white"
                  >
                    {person.name}
                    {person.job ? ` - ${person.job}` : ""}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h5 className="text-sm font-semibold text-white">Guest Stars</h5>
              {allGuestStars.length > 12 && !showAllGuestStars && (
                <button
                  type="button"
                  onClick={() => setShowAllGuestStars(true)}
                  className="text-xs font-medium text-primaryM-500 underline underline-offset-4 transition hover:text-primaryM-400"
                >
                  Show all ({allGuestStars.length})
                </button>
              )}
            </div>
            {allGuestStars.length === 0 ? (
              <p className="text-xs text-gray-400">
                No guest stars listed for this episode.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {visibleGuestStars.map((person) => (
                  <Link
                    key={`guest-${person.id}-${person.character ?? ""}`}
                    href={`/crew/${person.id}`}
                    className="rounded border border-white/15 px-2 py-1 text-xs text-gray-200 transition-colors hover:border-primaryM-500/60 hover:text-white"
                  >
                    {person.name}
                    {person.character ? ` as ${person.character}` : ""}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
