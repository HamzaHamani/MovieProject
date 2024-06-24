"use client";
import usePage from "@/hooks/usePage";
import { TsearchMovie } from "@/types/api";
import { useSearchParams } from "next/navigation";

type Props = {
  data: TsearchMovie;
};

export default function SearchMoviesDisplay({ data }: Props) {
  return (
    <div className="mt-6 grid grid-cols-5 gap-5">
      {data?.results?.map((movie) => (
        <div
          className="after-img h-[500px] w-[350px] cursor-pointer overflow-hidden rounded bg-gray-200"
          key={movie.id}
        >
          <img
            loading="lazy"
            src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
            alt="movie poster"
            className="h-full w-full object-cover transition-all duration-200 ease-linear hover:scale-110"
          />
        </div>
      ))}
    </div>
  );
}
