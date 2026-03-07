"use client";
import { Badge } from "@/components/ui/badge";

import { TvideoApiSchema } from "@/types/video";
import LazyYouTubeEmbed from "./LazyYouTubeEmbed";
import { useState } from "react";

type Props = {
  res: TvideoApiSchema;
};
export function CarouselComponent({ res }: Props) {
  const [visibleCount, setVisibleCount] = useState(6);
  const videos = res.results.slice(0, visibleCount);
  const hasMore = res.results.length > visibleCount;

  if (!res.results.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center text-sm text-gray-300">
        No videos available for this title yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 justify-items-center gap-5 xl:grid-cols-2 md:grid-cols-1">
        {videos.map((video, index) => (
          <article
            key={video.id ?? `${video.key}-${index}`}
            className="group flex h-full w-full max-w-[460px] flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.01] transition hover:-translate-y-0.5 hover:border-primaryM-500/40"
          >
            <div className="h-[340px] w-full overflow-hidden bg-black xl:h-[300px] lg:h-[270px] md:h-[250px] s:h-[220px]">
              <LazyYouTubeEmbed videoId={video.key} />
            </div>

            <div className="flex h-full flex-col gap-3 p-3">
              <h3 className="line-clamp-2 min-h-12 text-base font-medium text-white s:text-sm">
                {video.name}
              </h3>

              <div className="mt-auto flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Badge className="shrink-0 bg-slate-50 text-backgroundM smd:text-[10px]">
                    {video.type === "Behind the Scenes" ? "BTS" : video.type}
                  </Badge>
                  <p className="truncate text-sm text-gray-300 s:text-xs">
                    {new Date(video.published_at).getFullYear()}-
                    {(new Date(video.published_at).getMonth() + 1)
                      .toString()
                      .padStart(2, "0")}
                    -
                    {new Date(video.published_at)
                      .getDate()
                      .toString()
                      .padStart(2, "0")}
                  </p>
                </div>

                <a
                  href={`https://www.youtube.com/watch?v=${video.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-md border border-white/20 px-2 py-1 text-xs text-gray-200 transition hover:border-primaryM-500/60 hover:text-white"
                >
                  Watch
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            className="rounded-lg bg-primaryM-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-primaryM-600"
            onClick={() => setVisibleCount((prev) => prev + 6)}
          >
            Show more videos
          </button>
        </div>
      )}
    </>
  );
}
