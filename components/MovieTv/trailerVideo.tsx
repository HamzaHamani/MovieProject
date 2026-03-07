import { getSpecifiedTVMovieVideos } from "@/lib/actions";
import { delay } from "@/lib/utils";
import React from "react";
import { Badge } from "../ui/badge";

type Props = {
  id: any;
  typeM: "movie" | "tv";
};

export default async function TrailerVideo({ id, typeM }: Props) {
  async function fetchVideos() {
    try {
      await delay(10000);
      const data = await getSpecifiedTVMovieVideos(id, "movie");
      return data;
    } catch (e) {
      throw new Error("Failed to fetch the videos");
    }
  }
  const videos = await fetchVideos();

  function trailerMovieComp(video: any) {
    return (
      <div key={video.id} className="flex flex-col gap-2">
        <div>
          <iframe
            width="448"
            height="252"
            src={`https://www.youtube.com/embed/${video.key}?modestbranding=1&rel=0&iv_load_policy=3`}
            title={video.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <h3>
          {(() => {
            const name = video.name;
            return name.length > 48 ? name.slice(0, 48) + "..." : name;
          })()}
        </h3>
        <div className="flex gap-2">
          <Badge className="bg-slate-50 text-backgroundM">{video.type}</Badge>
          <span className="text-muted-foreground">|</span>
          <p>
            {new Date(video.published_at).getFullYear()}-
            {(new Date(video.published_at).getMonth() + 1)
              .toString()
              .padStart(2, "0")}
            -
            {new Date(video.published_at).getDate().toString().padStart(2, "0")}
          </p>
        </div>
      </div>
    );
  }
  return (
    <section className="mt-10">
      <h3 className="mb-4 mt-4 text-3xl font-medium xl:text-2xl">
        Trailers / Videos
      </h3>

      <div>{videos.results.map((video) => trailerMovieComp(video))}</div>
    </section>
  );
}
