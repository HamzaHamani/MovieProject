import { TspecifiedMovie } from "@/types/api";

import FirstContainer from "../MovieTv/firstContainer";
import Story from "../MovieTv/storyComponent";
import CastComponent from "../MovieTv/carouselCast/castComponent";
import TrailerVideo from "../MovieTv/trailerVideo";
import { Suspense } from "react";
import VideoLoadingIndicator from "../MovieTv/videoLoadingIndicator";
import { Badge } from "lucide-react";
import { CarouselComponent } from "../MovieTv/carouselCast/carouselComponent";
import TrailerComponent from "../MovieTv/carouselTrailer/trailerComponent";

type Props = {
  response: TspecifiedMovie;
  typeM?: "movie" | "tv";
};

export default function WholeDisplay({ response }: Props) {
  const imageUrl = `https://image.tmdb.org/t/p/original${response.backdrop_path}`;
  return (
    <div className="relative h-screen">
      <div className="relative h-[53.5vh] w-full s:h-[45vh]">
        {response.backdrop_path && (
          <div
            className="absolute inset-0 h-full w-full bg-cover bg-center opacity-65"
            style={{
              backgroundImage: `url(${imageUrl})`, // Replace imageUrl with your actual image URL
              backgroundPosition: "top", // Ensure image starts from the top
            }}
          ></div>
        )}
        <div
          className="absolute -bottom-10 z-10 h-56 w-full"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13, 12, 15, 0.01),rgba(13, 12, 15, 0.5), #0d0c0f, #0d0c0f)",
          }}
        ></div>
        <section className="relative z-20 col-span-2 mx-auto flex h-[107%] w-[90%] flex-col justify-end gap-5">
          <FirstContainer response={response} typeM="movie" />
        </section>
        <section className="mx-auto mt-10 w-[90%]">
          <Story response={response} typeM="tv" />
          <Suspense
            fallback={
              <div className="flex h-20 items-center justify-center">
                Loading Cast...
              </div>
            }
          >
            <CastComponent typeM="movie" id={response.id} />
          </Suspense>
          <Suspense fallback={<VideoLoadingIndicator />}>
            <TrailerComponent typeM="movie" id={response.id} />
          </Suspense>
        </section>

        <div className="h-screen"></div>
      </div>
    </div>
  );
}
