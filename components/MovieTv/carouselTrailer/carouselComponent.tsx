"use client";
import { Badge } from "@/components/ui/badge";

import { TvideoApiSchema } from "@/types/video";
import LazyYouTubeEmbed from "./LazyYouTubeEmbed";
import { useState } from "react";

type Props = {
  res: TvideoApiSchema;
};
export function CarouselComponent({ res }: Props) {
  const [visibleCount, setVisibleCount] = useState(5);
  const videos = res.results.slice(0, visibleCount);
  const hasMore = res.results.length > visibleCount;
  // return (
  //   <Carousel
  //     opts={{
  //       align: "center",
  //       loop: true,
  //     }}
  //     className="w-full"
  //   >
  //     <CarouselContent>
  //       {res.results.map((video, index) => (
  //         <CarouselItem
  //           key={index}
  //           className="-ml-0 flex basis-1/5 items-center justify-center xds:basis-1/4 Ctex6:basis-1/3 h1text8:basis-1/2 ss:basis-1/2 s:basis-full"
  //         >
  //           <div key={video.id} className="flex h-full flex-col gap-2">
  //             <div className="aspect-[268/151] w-[268px] max-w-[40vw] flex-shrink-0 overflow-hidden rounded-lg bg-black s:w-[320px] s:max-w-[90vw]">
  //               <LazyYouTubeEmbed videoId={video.key} />
  //             </div>
  //             <h3 className="w-full max-w-[268px]">
  //               {(() => {
  //                 const name = video.name;
  //                 return name.length > 48 ? name.slice(0, 48) + "..." : name;
  //               })()}
  //             </h3>
  //             <div className="flex-1" />
  //             <div className="mt-auto flex w-full max-w-[268px] items-center gap-2">
  //               <Badge className="bg-slate-50 text-backgroundM smd:text-[10px]">
  //                 {video.type === "Behind the Scenes" ? "BTS" : video.type}
  //               </Badge>
  //               <span className="text-muted-foreground">|</span>
  //               <p className="sm:text-xs">
  //                 {new Date(video.published_at).getFullYear()}-
  //                 {(new Date(video.published_at).getMonth() + 1)
  //                   .toString()
  //                   .padStart(2, "0")}
  //                 -
  //                 {new Date(video.published_at)
  //                   .getDate()
  //                   .toString()
  //                   .padStart(2, "0")}
  //               </p>
  //             </div>
  //           </div>
  //         </CarouselItem>
  //       ))}
  //     </CarouselContent>
  //     <div className="absolute -bottom-10 right-0 mt-5 flex gap-2">
  //       <CarouselPrevious className="h1tex:hidden" />
  //       <CarouselNext className="h1tex:hidden" />
  //     </div>
  //   </Carousel>
  // );
  return (
    <>
      <div className="flex flex-wrap justify-center gap-1">
        {videos.map((video, index) => (
          <div key={index} className="-ml-0">
            <div className="flex h-full flex-col gap-2">
              <div className="aspect-[16/9] w-[330px] max-w-[45vw] flex-shrink-0 overflow-hidden rounded-lg bg-black s:w-[380px] s:max-w-[95vw]">
                <LazyYouTubeEmbed videoId={video.key} />
              </div>
              <h3 className="w-full max-w-[340px]">
                {(() => {
                  const name = video.name;
                  return name.length > 48 ? name.slice(0, 48) + "..." : name;
                })()}
              </h3>
              <div className="flex-1" />
              <div className="mt-auto flex w-full max-w-[340px] items-center gap-2">
                <Badge className="bg-slate-50 text-backgroundM smd:text-[10px]">
                  {video.type === "Behind the Scenes" ? "BTS" : video.type}
                </Badge>
                <span className="text-muted-foreground">|</span>
                <p className="sm:text-xs">
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
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            className="ml-auto rounded bg-primaryM-500 px-3 py-1.5 text-sm text-black transition hover:bg-primary/80 hover:bg-primaryM-600"
            onClick={() => setVisibleCount((prev) => prev + 10)}
          >
            Show more
          </button>
        </div>
      )}
    </>
  );
}
