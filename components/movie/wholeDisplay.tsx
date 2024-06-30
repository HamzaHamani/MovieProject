import { TspecifiedMovie } from "@/types/api";
import { Suspense } from "react";
import VideoLoadingIndicator from "../MovieTv/videoLoadingIndicator";
import TrailerVideo from "../MovieTv/trailerVideo";

type Props = {
  response: TspecifiedMovie;
};

export default function WholeDisplay({ response }: Props) {
  const movieId = response.id;

  const posterUrl = `https://image.tmdb.org/t/p/original${response.poster_path}`;
  const imageUrl = `https://image.tmdb.org/t/p/original${response.backdrop_path}`;
  return (
    <div className="relative h-screen">
      <div className="relative h-[60.5vh] w-full">
        {response.backdrop_path && (
          <img
            src={imageUrl}
            alt="Background"
            className="absolute h-full w-full object-cover opacity-65"
          />
        )}
        <div
          className="absolute -bottom-10 z-10 h-44 w-full"
          style={{
            background:
              "linear-gradient(to bottom, rgba(17, 17, 17, 0.01),rgba(17, 17, 17, .5), #111111, #111111)",
          }}
        ></div>
        <div className="container relative z-20 col-span-2 grid h-screen grid-cols-3 items-center justify-center gap-5">
          <div className="col-span-1 h-[550px] w-[400px] bg-gray-50">
            <img src={posterUrl} alt="Movie Poster" />
          </div>
          <div className="col-span-2 flex h-[550px] flex-col justify-start gap-5">
            <h3 className="mb-2 text-7xl font-extrabold tracking-tight text-primaryM-500">
              {response.title}
            </h3>
            <div className="mb-5 flex gap-2">
              {response.genres.map((genre) => (
                <span
                  className="rounded-full bg-white p-1 px-4 text-black"
                  key={genre.name}
                >
                  {genre.name}
                </span>
              ))}
              {
                <span className="rounded-full bg-red-600 p-1 px-4 text-black">
                  +18
                </span>
              }
            </div>
            <p>{response.overview}</p>
            <div>
              <h3>Casts</h3>
              <div className="h-[100px] w-[200px] bg-gray-50"></div>
            </div>
          </div>
        </div>
        <Suspense fallback={<VideoLoadingIndicator />}>
          <TrailerVideo id={movieId} />
        </Suspense>
      </div>
    </div>
  );
}
