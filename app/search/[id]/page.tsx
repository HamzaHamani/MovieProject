import MovieSkeleton from "@/components/general/movieSkeleton";
import SearcMovieNavigation from "@/components/search/movieNavigation";
import SearchMoviesDisplay from "@/components/search/moviesDisplay";
import { getSearchMovie } from "@/lib/actions";
import { TsearchMovie } from "@/types/api";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import { Suspense } from "react";
`export const dynamic ='force-dynamic'`;
type Props = {
  params: {
    id: string;
  };
};

export default async function page({ params }: Props) {
  try {
    const data = await getSearchMovie(params.id);
    return <RenderUi data={data} />;
  } catch (error: any) {
    console.log(error);
  }
}

function RenderUi({ data }: { data: TsearchMovie }) {
  return (
    <div className="mx-auto mt-20 w-[90%]">
      <SearcMovieNavigation data={data} />
      <SearchMoviesDisplay data={data} />{" "}
    </div>
  );
}
