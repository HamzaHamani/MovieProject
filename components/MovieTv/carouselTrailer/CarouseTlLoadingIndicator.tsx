import { Skeleton } from "../../ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
type Props = {};

export default function CarouselTLoadingIndicator({}: Props) {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-0 flex basis-1/6 items-center justify-center xds:basis-1/5 Ctex6:basis-1/4 h1text8:basis-1/3 ss:basis-1/2 s:basis-52">
        {Array.from({ length: 10 }, (_, index) => (
          <CarouselItem
            key={index}
            className="-ml-0 flex basis-1/5 items-center justify-center xds:basis-1/4 Ctex6:basis-1/3 h1text8:basis-1/2 ss:basis-1/2 s:basis-full"
          >
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-[151px] w-[268px] bg-gray-50 xds:w-[180px] lg:w-[130px] s:w-[100px]" />

              <Skeleton className="h-4 w-[268px] bg-gray-50 xds:w-[180px] lg:w-[130px] s:w-[100px]" />
              <div className="flex gap-2">
                {" "}
                <Skeleton className="h-4 w-[80px] bg-gray-50 xds:w-[60px] lg:w-[50px] s:w-[50px]" />
                <span className="text-muted-foreground">|</span>
                <Skeleton className="h-4 w-[180px] bg-gray-50 xds:w-[140px] lg:w-[100px] s:w-[80px]" />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
