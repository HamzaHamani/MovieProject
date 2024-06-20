"use client";
import { TexploreApiSchema } from "@/types/api";
import { CarouselContent, CarouselItem } from "../ui/carousel";
import { useState } from "react";

type Props = {
  data: TexploreApiSchema[];
};

export default function CarouselExploreContent({ data }: Props) {
  const [slectedMovie, setSelectedMovie] = useState<TexploreApiSchema | any>(
    null
  );

  function activeCarouse(movie: TexploreApiSchema) {
    setSelectedMovie((value: number | null) => {
      if (value == movie.id) {
        return null;
      } else {
        return movie.id;
      }
    });
  }
  return (
    <CarouselContent className="flex items-end justify-center">
      {data.map((movie, index) => (
        <CarouselItem key={index} className="basis-1/7 pl-[18px]  ">
          <div
            className={`p-1 w-[230px] cursor-pointer rounded-lg transition-all ${
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
