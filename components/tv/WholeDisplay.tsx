import { TspecifiedTv } from "@/types/apiTv";
import FirstContainer from "../MovieTv/firstContainer";
import Story from "../MovieTv/storyComponent";

import CastComponent from "../MovieTv/carouselCast/castComponent";
import { Suspense } from "react";
import TrailerComponent from "../MovieTv/carouselTrailer/trailerComponent";
import VideoLoadingIndicator from "../MovieTv/videoLoadingIndicator";
import DetailTabs from "../MovieTv/detailTabs";
import SimilarSection from "../MovieTv/similarSection";
import { TSimilarItem } from "@/lib/actions";
import SeasonsLoadingIndicator from "../MovieTv/seasonsLoadingIndicator";
import ImagesLoadingIndicator from "../MovieTv/imagesLoadingIndicator";
import TvEpisodesSectionAsync from "../MovieTv/tvEpisodesSectionAsync";
import ImagesSectionAsync from "../MovieTv/imagesSectionAsync";
import ReviewsLoadingIndicator from "../MovieTv/reviewsLoadingIndicator";
import ReviewsSectionAsync from "../MovieTv/reviewsSectionAsync";
import WatchProvidersSectionAsync from "../MovieTv/watchProvidersSectionAsync";
import WatchProvidersLoadingIndicator from "../MovieTv/watchProvidersLoadingIndicator";

type Props = {
  response: TspecifiedTv;
  similar: TSimilarItem[];
  activeTab: "seasons" | "videos" | "images" | "reviews" | "providers";
  selectedSeason?: number | null;
  selectedEpisode?: number | null;
};

export default function WholeDisplay({
  response,
  similar,
  activeTab,
  selectedSeason,
  selectedEpisode,
}: Props) {
  const imageUrl = `https://image.tmdb.org/t/p/original${response.backdrop_path}`;
  return (
    <div className="relative min-h-screen pb-20">
      <div className="relative h-[56vh] w-full s:h-[46vh]">
        {response.backdrop_path && (
          <div
            className="absolute inset-0 h-full w-full bg-cover bg-center opacity-65"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: "top",
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
        <section className="relative z-20 mx-auto flex h-[110%] w-[90%] flex-col justify-end gap-5">
          <FirstContainer response={response} typeM="tv" />
        </section>

        <section className="mx-auto mt-12 w-[90%]">
          <Story response={response} typeM="tv" />

          <CastComponent typeM="tv" id={response.id} />

          <DetailTabs
            items={[
              { key: "seasons", label: "Seasons" },
              { key: "videos", label: "Trailers / Videos" },
              { key: "images", label: "Images" },
              { key: "reviews", label: "Reviews" },
              { key: "providers", label: "Watch Providers" },
            ]}
            active={activeTab}
            typeM="tv"
            id={response.id}
          />

          {activeTab === "seasons" && (
            <Suspense
              fallback={
                <SeasonsLoadingIndicator
                  title={
                    selectedEpisode
                      ? `Seasons / Episodes / Episode ${selectedEpisode}`
                      : selectedSeason
                        ? "Seasons / Episodes"
                        : "Seasons"
                  }
                />
              }
            >
              <TvEpisodesSectionAsync
                id={response.id}
                selectedSeason={selectedSeason}
                selectedEpisode={selectedEpisode}
              />
            </Suspense>
          )}

          {activeTab === "videos" && (
            <Suspense fallback={<VideoLoadingIndicator />}>
              <TrailerComponent typeM="tv" id={response.id} />
            </Suspense>
          )}

          {activeTab === "images" && (
            <Suspense fallback={<ImagesLoadingIndicator />}>
              <ImagesSectionAsync id={response.id} typeM="tv" />
            </Suspense>
          )}

          {activeTab === "reviews" && (
            <Suspense fallback={<ReviewsLoadingIndicator />}>
              <ReviewsSectionAsync id={response.id} typeM="tv" />
            </Suspense>
          )}

          {activeTab === "providers" && (
            <Suspense fallback={<WatchProvidersLoadingIndicator />}>
              <WatchProvidersSectionAsync id={response.id} typeM="tv" />
            </Suspense>
          )}

          <SimilarSection items={similar} typeM="tv" />
        </section>
      </div>
    </div>
  );
}
