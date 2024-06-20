"use client";
import { TexploreApiSchema } from "@/types/api";
import { CarouselContent, CarouselItem } from "../ui/carousel";
import { useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

type Props = {
  data: TexploreApiSchema[];
};

export default function CarouselExploreContent({ data }: Props) {
  const [slectedMovie, setSelectedMovie] = useState<TexploreApiSchema | any>(
    null
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = new URLSearchParams(Array.from(searchParams.entries())); // -> has to use this form
  //? if there is no movie search param in url, we add one with the first id from the data
  //? i did it cuz so i can get a backdrop image of a movie immediatly when the page loads, and the movie get activated in the carousel
  if (!current.has("movie")) {
    current.set("movie", data[0].id.toString());
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  }
  function activeCarouse(movie: TexploreApiSchema) {
    setSelectedMovie((value: number | null) => {
      if (value == movie.id) {
        return null;
      } else {
        return movie.id;
      }
    });

    current.set("movie", movie.id.toString());
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);

    // searchParams.set("movie", movie.id.toString());
  }

  return (
    <CarouselContent className="flex items-end  justify-center">
      {data.map((movie, index) => (
        <CarouselItem key={index} className="basis-1/7 pl-[25px]  ">
          <div
            className={`p-1 w-[200px] cursor-pointer rounded-lg duration-300 transition-all ${
              slectedMovie == movie.id ? "w-[270px]" : ""
            }`}
            onClick={() => activeCarouse(movie)}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
              alt="movie poster "
              className={`w-full h-full  transition-all object-cover rounded-lg ${
                slectedMovie == movie.id ? "" : ""
              }  `}
            />
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
  );
}
