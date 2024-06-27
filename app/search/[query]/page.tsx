"use client";
import SearcMovieNavigation from "@/components/search/movieNavigation";
import SearchMoviesDisplay from "@/components/search/moviesDisplay";
import { SearchVanishComp } from "@/components/search/searchVanishComp";
import usePage from "@/hooks/usePage";
import { getSearchMovie } from "@/lib/actions";
import { TsearchMovie } from "@/types/api";
import MovieLoadingIndicator from "../../../components/search/movieLoadingIndicator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import NoResults from "@/components/search/noResults";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    query: string;
  };
};
type SearchMovieQueryKey = [string, string, number];

const Page = ({ params }: Props) => {
  const queryClient = useQueryClient();
  const { query } = params;
  const { page, nextPage, prevPage } = usePage();

  const prefetchNextPage = async () => {
    await queryClient.prefetchQuery({
      queryFn: fetchSearchMovie,
      queryKey: ["searchMovie", query, page + 1],
    });
  };
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

  const { data, error, isLoading, isSuccess } = useQuery({
    queryFn: fetchSearchMovie,
    queryKey: ["searchMovie", query, page],
  });
  if (isSuccess) prefetchNextPage();
  if (isLoading) return <MovieLoadingIndicator />;
  if (error) return <div>Error: {error.message}</div>;
  if (data?.results.length == 0) return <NoResults />;

  // return <MovieLoadingIndicator />;
  return data ? <RenderUi data={data} /> : null;
};

function RenderUi({ data }: { data: TsearchMovie }) {
  return (
    <div className="mx-auto w-[90%]">
      <div className="mt-20">
        <SearchVanishComp />
      </div>
      <SearcMovieNavigation data={data} />
      <SearchMoviesDisplay data={data} />
    </div>
  );
}

export default Page;
