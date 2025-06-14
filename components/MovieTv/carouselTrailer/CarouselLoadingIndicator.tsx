import { Skeleton } from "../../ui/skeleton";
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
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-[252px] w-[448px] bg-gray-50" />

            <Skeleton className="h-4 w-[448px] bg-gray-50" />
            <div className="flex gap-2">
              {" "}
              <Skeleton className="h-4 w-[100px] bg-gray-50" />
              <span className="text-muted-foreground">|</span>
              <Skeleton className="h-4 w-[200px] bg-gray-50" />
            </div>
          </div>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
