import { TspecifiedTv } from "@/types/apiTv";
import { GrDocumentMissing } from "react-icons/gr";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Props = {
  response: TspecifiedTv;
};

export default function TvEpisodesSection({ response }: Props) {
  const seasons = response.seasons
    .filter((season) => season.season_number > 0)
    .slice(0, 8);

  if (!seasons.length) {
    return null;
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-3xl font-medium xl:text-2xl smd:text-xl">Episodes</h3>
        <div className="rounded border border-white/20 px-2 py-1 text-xs text-gray-300">
          Season {response.number_of_seasons}
        </div>
      </div>

      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {seasons.map((season) => (
            <CarouselItem
              key={`season-${season.id}`}
              className="basis-[280px] pl-4 xl:basis-[250px] lg:basis-[220px] h1text8:basis-[200px] smd:basis-[180px] sss:basis-[165px] s:basis-[175px]"
            >
              <article className="group overflow-hidden rounded-xl border border-white/5 bg-[#101018]">
                <div className="relative h-[360px] overflow-hidden rounded-xl xl:h-[330px] lg:h-[300px] h1text8:h-[280px] smd:h-[250px] sss:h-[230px] s:h-[250px]">
                  {season.poster_path ? (
                    <img
                      loading="lazy"
                      src={`https://image.tmdb.org/t/p/w500/${season.poster_path}`}
                      alt={season.name}
                      className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-700">
                      <GrDocumentMissing className="text-4xl smd:text-3xl sss:text-2xl" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/10" />

                  <div className="absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-black via-black/80 to-transparent p-3 smd:p-2.5 sss:p-2">
                    <h4 className="line-clamp-1 text-base font-semibold lg:text-sm smd:text-[13px] sss:text-xs">
                      {season.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-200 smd:gap-1.5 smd:text-[11px] sss:text-[10px]">
                      <span>{season.episode_count} episodes</span>
                      <span>•</span>
                      <span>{season.air_date?.slice(0, 4) || "----"}</span>
                    </div>
                  </div>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute -bottom-8 right-0 flex gap-2 smd:static smd:mt-3 smd:justify-end">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </section>
  );
}
