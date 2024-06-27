import { CarouselExplore } from "@/components/explore/carouselExplore";
import { getSpecifiedMovie } from "@/lib/actions";
import { TexploreApiSchema, TspecifiedMovie } from "@/types/api";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

let specifiedMovie: TspecifiedMovie;

export default async function Explore({ searchParams }: Props) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1&api_key=${process.env.TMDB_API_KEY}`,

    { next: { revalidate: 3600 } },
  );
  const result = await res.json();
  const data: TexploreApiSchema[] = result.results;

  if (searchParams.movie) {
    specifiedMovie = await getSpecifiedMovie(searchParams.movie as string);
  }
  return (
    <div className="h-screen">
      <div
        className="absolute top-0 -z-10 h-screen w-full object-cover opacity-70"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original/${specifiedMovie?.backdrop_path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="flex h-[91.5vh] flex-col justify-between">
        <div></div>
        <CarouselExplore data={data} />
      </div>
    </div>
  );
}
