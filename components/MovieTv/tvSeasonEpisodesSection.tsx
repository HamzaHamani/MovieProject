"use client";

import { TTvSeasonDetails } from "@/lib/actions";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import { GrDocumentMissing } from "react-icons/gr";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SeasonsLoadingIndicator from "./seasonsLoadingIndicator";

type Props = {
  tvId: number;
  season: TTvSeasonDetails;
};

export default function TvSeasonEpisodesSection({ tvId, season }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingEpisode, setPendingEpisode] = useState<number | null>(null);

  useEffect(() => {
    if (!isPending) {
      setPendingEpisode(null);
    }
  }, [isPending]);

  const onSelectEpisode = (episodeNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "seasons");
    params.set("season", String(season.season_number));
    params.set("episode", String(episodeNumber));

    setPendingEpisode(episodeNumber);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const episodes = (season.episodes ?? []).slice(0, 20);

  if (pendingEpisode) {
    return (
      <SeasonsLoadingIndicator
        title={`Seasons / Episodes / Episode ${pendingEpisode}`}
      />
    );
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-3xl font-medium xl:text-2xl smd:text-xl">
          Seasons / Episodes
        </h3>
        <Link
          href={`/tv/${tvId}?tab=seasons`}
          scroll={false}
          className="text-sm font-medium text-primaryM-500 underline underline-offset-4 transition hover:text-primaryM-400"
        >
          Back to seasons
        </Link>
      </div>

      {episodes.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#101018] p-4 text-sm text-gray-300">
          No episodes available for this season.
        </div>
      ) : (
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {episodes.map((episode) => (
              <CarouselItem
                key={`episode-${episode.id}`}
                className="basis-[280px] pl-4 xl:basis-[250px] lg:basis-[220px] h1text8:basis-[200px] smd:basis-[180px] sss:basis-[165px] s:basis-[175px]"
              >
                <button
                  type="button"
                  onClick={() => onSelectEpisode(episode.episode_number)}
                  className="block w-full text-left"
                >
                  <article className="group overflow-hidden rounded-xl border border-white/5 bg-[#101018]">
                    <div className="relative h-[360px] overflow-hidden rounded-xl xl:h-[330px] lg:h-[300px] h1text8:h-[280px] smd:h-[250px] sss:h-[230px] s:h-[250px]">
                      {episode.still_path ? (
                        <LazyBlurImage
                          src={`https://image.tmdb.org/t/p/w500/${episode.still_path}`}
                          alt={episode.name}
                          className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110"
                          placeholderClassName="bg-zinc-700/50"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-700">
                          <GrDocumentMissing className="text-4xl smd:text-3xl sss:text-2xl" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/10" />

                      <div className="absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-black via-black/80 to-transparent p-3 smd:p-2.5 sss:p-2">
                        <h4 className="line-clamp-1 text-base font-semibold lg:text-sm smd:text-[13px] sss:text-xs">
                          E{episode.episode_number}. {episode.name}
                        </h4>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-200 smd:gap-1.5 smd:text-[11px] sss:text-[10px]">
                          <span>
                            {episode.runtime ? `${episode.runtime} min` : "-- min"}
                          </span>
                          <span>•</span>
                          <span>{episode.air_date?.slice(0, 4) || "----"}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="absolute -bottom-8 right-0 flex gap-2 smd:static smd:mt-3 smd:justify-end">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      )}
    </section>
  );
}
