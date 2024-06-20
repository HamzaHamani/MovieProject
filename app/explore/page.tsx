import { CarouselExplore } from "@/components/explore/carouselExplore";
import { getSpecifiedMovie } from "@/lib/actions";
import { TexploreApiSchema } from "@/types/api";
import Image from "next/image";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

let specifiedMovie;

export default async function Explore({ searchParams }: Props) {
  console.log(searchParams);
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1%&api_key=${process.env.TMDB_API_KEY}`,
    { next: { revalidate: 3600 } }
  );
  const result = await res.json();
  const data: TexploreApiSchema[] = result.results;

  if (searchParams.movie) {
    specifiedMovie = await getSpecifiedMovie(searchParams.movie as string);
    console.log(specifiedMovie);
  }
  return (
    <div className="h-[100vh] ">
      <div className="w-full h-[92.7vh] absolute top-0 -z-10 opacity-70 object-cover">
        <img
          src={"https://image.tmdb.org/t/p/w500/"}
          // width={1920}
          // height={1080}
          className="object-cover" // necessary
          alt="image of a movie"
        />
      </div>

      <div className=" h-[90vh] flex flex-col justify-between">
        <div></div>
        <CarouselExplore data={data} />
      </div>
    </div>
  );
}
