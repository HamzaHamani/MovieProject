"use client";
import SearcMovieNavigation from "@/components/search/movieNavigation";
import SearchMoviesDisplay from "@/components/search/moviesDisplay";
import { SearchVanishComp } from "@/components/search/searchVanishComp";
import usePage from "@/hooks/usePage";
import { getSearchMovie } from "@/lib/actions";
import { TsearchMovie } from "@/types/api";
import MovieLoadingIndicator from "../../../components/search/movieLoadingIndicator";
import { useQuery } from "@tanstack/react-query";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    query: string;
  };
};
type SearchMovieQueryKey = [string, string, number];

const Page = ({ params }: Props) => {
  const { query } = params;
  const { page, nextPage, prevPage } = usePage();

  const fetchSearchMovie = async ({
    queryKey,
  }: {
    queryKey: SearchMovieQueryKey;
  }) => {
    const [, query, page] = queryKey;
    const values = {
      query: query,
      page: page,
    };
    const data: TsearchMovie = (await getSearchMovie(values)) as TsearchMovie;
    return data;
  };

  const { data, error, isLoading } = useQuery({
    queryFn: fetchSearchMovie,
    queryKey: ["searchMovie", query, page],
  });

  if (isLoading) return <MovieLoadingIndicator />;
  if (error) return <div>Error: {error.message}</div>;

  return data ? <RenderUi data={data} /> : null;
};

function RenderUi({ data }: { data: TsearchMovie }) {
  return (
    <div className="mx-auto mt-20 w-[90%]">
      <SearchVanishComp />
      <SearcMovieNavigation data={data} />
      <SearchMoviesDisplay data={data} />
    </div>
  );
}

export default Page;
