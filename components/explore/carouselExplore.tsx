import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TexploreApiSchema } from "@/types/api";
import CarouselExploreContent from "./carouselExploreContent";

export async function CarouselExplore() {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1%&api_key=${process.env.TMDB_API_KEY}`
  );
  const result = await res.json();
  const data: TexploreApiSchema[] = result.results;

  return (
    <Carousel
      opts={{
        align: "center",
      }}
      className="w-[100%] mx-auto overflow-visible"
    >
      <CarouselExploreContent data={data} />
      {/* <CarouselPrevious />
      <CarouselNext /> */}
    </Carousel>
  );
}
