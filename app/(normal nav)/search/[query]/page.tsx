"use client";
import SearcMovieNavigation from "@/components/search/movieNavigation";
import SearchMoviesDisplay from "@/components/search/moviesDisplay";
import { SearchVanishComp } from "@/components/search/searchVanishComp";
import usePage from "@/hooks/usePage";
import type { SearchMode, TsearchApiResponse } from "@/types/api";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import NoResults from "@/components/search/noResults";
import MovieLoadingIndicator from "@/components/search/movieLoadingIndicator";
import { use, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    query: string;
  }>;
  searchParams: Promise<{
    type?: string;
  }>;
};

type SearchQueryKey = [string, SearchMode, string, number];

function normalizeSearchMode(value: string | undefined): SearchMode {
  if (value === "film" || value === "tv" || value === "person") {
    return value;
  }

  return "all";
}

const Page = ({ params, searchParams }: Props) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { query } = use(params);
  const { type } = use(searchParams);
  const { page } = usePage();
  const currentType = normalizeSearchMode(type);

  const prefetchNextPage = async () => {
    await queryClient.prefetchQuery({
      queryFn: fetchSearchMovie,
      queryKey: ["searchMovie", currentType, query, page + 1],
    });
  };
  const fetchSearchMovie = async ({
    queryKey,
  }: {
    queryKey: SearchQueryKey;
  }) => {
    const [, activeType, searchQuery, searchPage] = queryKey;
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(searchQuery)}&type=${activeType}&page=${searchPage}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to search");
    }

    return (await response.json()) as TsearchApiResponse;
  };

  const { data, error, isLoading, isSuccess } = useQuery({
    queryFn: fetchSearchMovie,
    queryKey: ["searchMovie", currentType, query, page],
  });

  useEffect(() => {
    if (!isSuccess) return;
    prefetchNextPage();
  }, [isSuccess, query, page, currentType]);

  if (isLoading) return <MovieLoadingIndicator />;
  if (error) return <div>Error: {error.message}</div>;

  return data ? (
    <RenderUi query={query}>
      <SearcMovieNavigation
        data={data}
        query={query}
        activeType={currentType}
        onTypeChange={(nextType) => {
          router.push(`/search/${encodeURIComponent(query)}?type=${nextType}`);
        }}
      />
      {data.results.length === 0 ? (
        <NoResults />
      ) : (
        <SearchMoviesDisplay data={data} />
      )}
    </RenderUi>
  ) : null;
};

function RenderUi({
  query,
  children,
}: {
  query: string;
  children?: ReactNode;
}) {
  return (
    <>
      <title>{`${query} | Cine-Sphere `}</title>

      <div className="mx-auto w-[90%]">
        <div className="mt-20">
          <SearchVanishComp />
        </div>

        {children}
      </div>
    </>
  );
}

export default Page;
