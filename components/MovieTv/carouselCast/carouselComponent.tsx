import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TCreditsSchema } from "@/types/cast";

type Props = {
  res: TCreditsSchema;
};
export function CarouselComponent({ res }: Props) {
  const popularCast = res.cast
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10);
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent>
        {popularCast.map((cast, index) => (
          <CarouselItem
            key={index}
            className="-ml-0 flex basis-1/6 items-center justify-center xds:basis-1/5 Ctex6:basis-1/4 h1text8:basis-1/3 ss:basis-1/2 s:basis-52"
          >
            <div className="bg-re-500 p1 flex w-[300px] justify-center gap-2">
              <div className="h-[80px] w-[80px] overflow-hidden rounded-full bg-white xds:h-[70px] xds:w-[70px] lg:h-[65px] lg:w-[65px] s:h-[50px] s:w-[50px]">
                <img
                  src={`https://image.tmdb.org/t/p/w500/${cast.profile_path}`}
                  alt={cast.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col items-start justify-center">
                <h3 className="text-xl h1text2:text-base h1text8:text-sm">
                  {cast.name}
                </h3>
                <h4 className="text-sm text-gray-200 h1text2:text-xs h1text8:text-[10px]">
                  {cast.original_name}
                </h4>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="absolute -bottom-10 right-0 mt-5 flex gap-2">
        <CarouselPrevious className="h1tex:hidden" />
        <CarouselNext className="h1tex:hidden" />
      </div>
    </Carousel>
  );
}
