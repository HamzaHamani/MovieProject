import { getSpecifiedTVMovieVideos } from "@/lib/actions";
import { delay } from "@/lib/utils";
import React from "react";

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

  return (
    <div>
      {" "}
      {videos.results.map((video) => (
        <div key={video.id}>
          {" "}
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${video.key}?modestbranding=1&rel=0&iv_load_policy=3`}
            title={video.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ))}
    </div>
  );
}
