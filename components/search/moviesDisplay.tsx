"use client";
import usePage from "@/hooks/usePage";
import { TsearchMovie } from "@/types/api";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";

type Props = {
  data: TsearchMovie;
};

//TODO ADD ANIMATION WITH FRAMER MOTION

export default function SearchMoviesDisplay({ data }: Props) {
  return (
    <div className="relative mt-6 grid grid-cols-5 gap-5">
      {data?.results?.map((movie) => (
        <>
          <div
            className="after-img group relative h-[500px] w-[350px] cursor-pointer overflow-hidden rounded bg-gray-200"
            key={movie.id}
          >
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
        </>
      ))}
    </div>
  );
}
