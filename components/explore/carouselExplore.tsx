import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TexploreApiSchema } from "@/types/api";
import CarouselExploreContent from "./carouselExploreContent";
type Props = {
  data: TexploreApiSchema[];
};

export async function CarouselExplore({ data }: Props) {
  return (
    <Carousel
      opts={{
        align: "center",
      }}
      className="w-[100%] mx-auto overf"
    >
      <CarouselExploreContent data={data} />
      <CarouselPrevious />
      {/* <CarouselNext /> */}
    </Carousel>
  );
}
