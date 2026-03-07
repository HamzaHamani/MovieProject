"use client";
import { TsearchMovie } from "@/types/api";
import MovieTvCard from "../general/movieTvCard";

type Props = {
  data: TsearchMovie;
};
export default function SearchMoviesDisplay({ data }: Props) {
  return (
    <div className="relative mt-10 grid w-full grid-cols-5 items-start gap-5 xxl:grid-cols-4 ds:grid-cols-3 lg:grid-cols-3 xssmd:grid-cols-2 smd:grid-cols-2 s:grid-cols-1">
      {data?.results?.map((movie) => (
        <MovieTvCard
          key={movie.id}
          href={`/${movie.media_type == "movie" ? "movie" : "tv"}/${movie.id}`}
          posterPath={movie.poster_path}
          title={movie.media_type == "movie" ? movie?.title : movie.name}
          voteAverage={movie.vote_average}
          mediaTypeLabel={movie.media_type == "movie" ? "Movie" : "TV Show"}
          year={
            (movie.media_type == "movie"
              ? movie?.release_date
              : movie.first_air_date
            )?.slice(0, 4) || "----"
          }
          className="w-[300px] self-center xl:w-[280px] lg:w-[270px] h1text8:w-[240px] xsmd:w-[270px] smd:w-[230px] sss:w-[210px] s:w-[230px]"
          imageClassName="h-[430px] lg:h-[390px] h1text8:h-[360px] xsmd:h-[390px] smd:h-[330px] sss:h-[320px] s:h-[350px]"
        />
      ))}
    </div>
  );
}
