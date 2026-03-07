"use client";
import { TsearchMovie } from "@/types/api";
import MovieTvCard from "../general/movieTvCard";

type Props = {
  data: TsearchMovie;
};
export default function SearchMoviesDisplay({ data }: Props) {
  return (
    <div className="relative mt-10 grid w-full grid-cols-5 items-start justify-items-center gap-5 xxl:grid-cols-4 ds:grid-cols-3 lg:grid-cols-3 xssmd:grid-cols-2 smd:grid-cols-2 s:grid-cols-1">
      {data?.results?.map((movie) => (
        <MovieTvCard
          key={movie.id}
          href={`/${movie.media_type == "movie" ? "movie" : "tv"}/${movie.id}`}
          posterPath={movie.poster_path}
          title={
            movie.media_type == "movie"
              ? movie?.title || "Untitled"
              : movie.name || "Untitled"
          }
          voteAverage={movie.vote_average}
          mediaTypeLabel={movie.media_type == "movie" ? "Movie" : "TV Show"}
          year={
            (movie.media_type == "movie"
              ? movie?.release_date
              : movie.first_air_date
            )?.slice(0, 4) || "----"
          }
          className="w-full max-w-[340px] self-center xl:max-w-[310px] lg:max-w-[280px] h1text8:max-w-[250px] smd:max-w-[220px] sss:max-w-[200px] s:max-w-[210px]"
          imageClassName="h-[550px] xl:h-[430px] lg:h-[390px] h1text8:h-[400px] xsmd:h-[450px] smd:h-[350px] sss:h-[330px] s:h-[370px]"
        />
      ))}
    </div>
  );
}
