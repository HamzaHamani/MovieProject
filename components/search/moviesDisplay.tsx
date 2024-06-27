"use client";
import usePage from "@/hooks/usePage";
import { TsearchMovie } from "@/types/api";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { RiStarSFill } from "react-icons/ri";

import { Star, StarIcon } from "lucide-react";

type Props = {
  data: TsearchMovie;
};

//TODO ADD ANIMATION WITH FRAMER MOTION, change skelete color
//TODO ADD INDICATOR WHEN U LOG OUT OR LOG IN WITH TOAST

export default function SearchMoviesDisplay({ data }: Props) {
  return (
    <div className="relative mt-10 grid w-full grid-cols-5 items-center gap-5 xxl:grid-cols-4 lg:grid-cols-3 smd:grid-cols-2 s:grid-cols-1">
      {data?.results?.map((movie) => (
        <div className="flex flex-col gap-3" key={movie.id}>
          <div className="after-img group relative h-[550px] w-[400px] cursor-pointer self-center overflow-hidden rounded bg-gray-200 xl:h-[430px] xl:w-[310px] lg:w-[290px] h1text8:h-[400px] h1text8:w-[250px] xsmd:h-[300px] xsmd:w-[200px] smd:h-[350px] smd:w-[250px]">
            <img
              loading="lazy"
              src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
              alt="movie poster"
              className="h-full w-full object-cover transition-all duration-200 ease-linear hover:scale-110"
            />
            <div className="absolute top-0 flex h-[500px] w-full items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
              <Button className="bg-primaryM-500 text-lg text-black hover:bg-primaryM-300">
                More Details
              </Button>
            </div>
          </div>
          <div className="flex h-[100px] flex-col gap-2 p-2">
            <h2>{movie.title} </h2>
            <div className="flex items-center justify-between">
              <p>{movie.release_date}</p>
              <p className="flex p-1">
                <span>
                  <RiStarSFill className="text-2xl text-primaryM-500" />
                </span>{" "}
                {movie.vote_average}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
