import { TspecifiedMovie } from "@/types/api";

import FirstContainer from "../MovieTv/firstContainer";
import Story from "../MovieTv/storyComponent";
import CastComponent from "../MovieTv/carouselCast/castComponent";
import { Suspense } from "react";
import VideoLoadingIndicator from "../MovieTv/videoLoadingIndicator";
import TrailerComponent from "../MovieTv/carouselTrailer/trailerComponent";

import DetailTabs from "../MovieTv/detailTabs";
import SimilarSection from "../MovieTv/similarSection";
import { TSimilarItem } from "@/lib/actions";
import ImagesLoadingIndicator from "../MovieTv/imagesLoadingIndicator";
import ImagesSectionAsync from "../MovieTv/imagesSectionAsync";
import ReviewsLoadingIndicator from "../MovieTv/reviewsLoadingIndicator";
import ReviewsSectionAsync from "../MovieTv/reviewsSectionAsync";
import WatchProvidersSectionAsync from "../MovieTv/watchProvidersSectionAsync";
import WatchProvidersLoadingIndicator from "../MovieTv/watchProvidersLoadingIndicator";

type Props = {
  response: TspecifiedMovie;
  similar: TSimilarItem[];
  activeTab: "videos" | "images" | "reviews" | "providers";
  typeM?: "movie" | "tv";
};

export default function WholeDisplay({ response, similar, activeTab }: Props) {
  const imageUrl = `https://image.tmdb.org/t/p/original${response.backdrop_path}`;
  return (
    <div className="relative min-h-screen pb-20">
      <div className="relative h-[56vh] w-full s:h-[46vh]">
        {response.backdrop_path && (
          <div
            className="absolute inset-0 h-full w-full bg-cover bg-center opacity-65 md:bg-top"
            style={{
              backgroundImage: `url(${imageUrl})`,
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
        <section className="relative z-20 mx-auto flex h-[125%] w-[90%] flex-col justify-end gap-5">
          <FirstContainer response={response} typeM="movie" />
        </section>

        <section className="mx-auto mt-12 w-[90%]">
          <Story response={response} typeM="movie" />

          <CastComponent typeM="movie" id={response.id} />

          <DetailTabs
            items={[
              { key: "reviews", label: "Reviews" },
              { key: "videos", label: "Trailers / Videos" },
              { key: "images", label: "Images" },
              { key: "providers", label: "Watch Providers" },
            ]}
            active={activeTab}
            typeM="movie"
            id={response.id}
          />

          {activeTab === "videos" && (
            <Suspense fallback={<VideoLoadingIndicator />}>
              <TrailerComponent typeM="movie" id={response.id} />
            </Suspense>
          )}

          {activeTab === "images" && (
            <Suspense fallback={<ImagesLoadingIndicator />}>
              <ImagesSectionAsync id={response.id} typeM="movie" />
            </Suspense>
          )}

          {activeTab === "reviews" && (
            <Suspense fallback={<ReviewsLoadingIndicator />}>
              <ReviewsSectionAsync id={response.id} typeM="movie" />
            </Suspense>
          )}

          {activeTab === "providers" && (
            <Suspense fallback={<WatchProvidersLoadingIndicator />}>
              <WatchProvidersSectionAsync id={response.id} typeM="movie" />
            </Suspense>
          )}

          <SimilarSection items={similar} typeM="movie" />
        </section>
      </div>
    </div>
  );
}
