"use client";
import { TsearchMovie } from "@/types/api";
import { useSearchParams } from "next/navigation";

type Props = {
  data: TsearchMovie;
};

export default function SearchMoviesDisplay({ data }: Props) {
  const search = useSearchParams();
  console.log(search.get("page"));
  return (
    <div className="mt-6 grid grid-cols-5 gap-8">
      {data?.results?.map((movie) => (
        <div
          className="h-[480px] w-[320px] cursor-pointer overflow-hidden rounded bg-gray-200"
          key={movie.id}
        >
          <img
            src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
            alt="movie poster"
            className="h-full w-full object-cover transition-all duration-200 ease-linear hover:scale-110"
          />
        </div>
      ))}
    </div>
  );
}
