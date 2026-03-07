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
import DetailTabs from "../MovieTv/detailTabs";
import SimilarSection from "../MovieTv/similarSection";
import { TReviewItem, TSimilarItem } from "@/lib/actions";
import ReviewsSection from "../MovieTv/reviewsSection";

type Props = {
  response: TspecifiedMovie;
  similar: TSimilarItem[];
  reviews: TReviewItem[];
  activeTab: "universe" | "news" | "reviews";
  typeM?: "movie" | "tv";
};

export default function WholeDisplay({ response, similar, reviews, activeTab }: Props) {
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
        <section className="relative z-20 mx-auto flex h-[107%] w-[90%] flex-col justify-end gap-5">
          <FirstContainer response={response} typeM="movie" />
        </section>

        <section className="mx-auto mt-12 w-[90%]">
          <DetailTabs
            items={[
              { key: "universe", label: "Universe" },
              { key: "news", label: "News" },
              { key: "reviews", label: "Reviews" },
            ]}
            active={activeTab}
            typeM="movie"
            id={response.id}
          />

          {activeTab === "universe" && (
            <>
              <Story response={response} typeM="movie" />

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

              <SimilarSection items={similar} typeM="movie" />
            </>
          )}

          {activeTab === "news" && (
            <>
              <Suspense fallback={<VideoLoadingIndicator />}>
                <TrailerComponent typeM="movie" id={response.id} />
              </Suspense>
              <SimilarSection items={similar} typeM="movie" />
            </>
          )}

          {activeTab === "reviews" && <ReviewsSection items={reviews} />}
        </section>
      </div>
    </div>
  );
}
