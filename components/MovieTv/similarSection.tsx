import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import MovieTvCard from "@/components/general/movieTvCard";

import { TSimilarItem } from "@/lib/actions";

type Props = {
  items: TSimilarItem[];
  typeM: "movie" | "tv";
};

export default function SimilarSection({ items, typeM }: Props) {
  const list = items.slice(0, 10);

  if (!list.length) {
    return null;
  }

  return (
    <section className="mt-12">
      <h3 className="mb-5 text-3xl font-medium xl:text-2xl smd:text-xl">
        {typeM === "tv" ? "Similar TV Shows for you" : "Similar Movies for you"}
      </h3>

      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {list.map((item) => {
            const title = item.title ?? item.name ?? "Unknown";
            const year = (item.release_date ?? item.first_air_date ?? "").slice(
              0,
              4,
            );

            return (
              <CarouselItem
                key={`${typeM}-similar-${item.id}`}
                className="basis-[280px] pl-4 xl:basis-[250px] lg:basis-[220px] h1text8:basis-[200px] smd:basis-[180px] sss:basis-[165px] s:basis-[175px]"
              >
                <MovieTvCard
                  href={`/${typeM}/${item.id}`}
                  posterPath={item.poster_path}
                  title={title}
                  voteAverage={item.vote_average}
                  mediaTypeLabel={typeM === "movie" ? "Movie" : "TV Show"}
                  year={year || "----"}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <div className="absolute -bottom-8 right-0 flex gap-2 smd:static smd:mt-3 smd:justify-end">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </section>
  );
}
