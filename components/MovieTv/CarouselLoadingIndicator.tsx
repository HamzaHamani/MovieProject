import { Skeleton } from "../ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
type Props = {};

export default function CarouselLoadingIndicator({}: Props) {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent>
        {Array.from({ length: 10 }, (_, index) => (
          <CarouselItem
            key={index}
            className="Ctex6:basis-1/4 -ml-0 flex basis-1/6 items-center justify-center xds:basis-1/5 h1text8:basis-1/3 ss:basis-1/2 s:basis-52"
          >
            <div
              className="flex w-[300px] items-center justify-center gap-2"
              key={index}
            >
              <Skeleton className="h-[80px] w-[80px] overflow-hidden rounded-full bg-white xds:h-[70px] xds:w-[70px] lg:h-[65px] lg:w-[65px] s:h-[50px] s:w-[50px]" />
              <div className="flex flex-col items-start justify-center gap-2">
                <Skeleton className="h-2 w-[100px] rounded bg-gray-200 text-xl h1text2:text-base h1text8:text-sm" />
                <Skeleton className="h-2 w-[60px] rounded bg-gray-200 text-xl h1text2:text-base h1text8:text-sm" />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
