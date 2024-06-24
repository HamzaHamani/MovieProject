import { Carousel, CarouselPrevious } from "@/components/ui/carousel";
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
      className="overf mx-auto w-[100%]"
    >
      <CarouselExploreContent data={data} />
      <CarouselPrevious />
      {/* <CarouselNext /> */}
    </Carousel>
  );
}
