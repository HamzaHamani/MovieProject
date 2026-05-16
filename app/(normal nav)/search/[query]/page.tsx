"use client";
import SearcMovieNavigation from "@/components/search/movieNavigation";
import SearchMoviesDisplay from "@/components/search/moviesDisplay";
import { SearchVanishComp } from "@/components/search/searchVanishComp";
import usePage from "@/hooks/usePage";
import type { SearchMode, TsearchApiResponse } from "@/types/api";
import MovieSkeleton from "@/components/general/movieSkeleton";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import NoResults from "@/components/search/noResults";
import MovieLoadingIndicator from "@/components/search/movieLoadingIndicator";
import { use, useEffect, useState, type ReactNode } from "react";
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
type SearchQueryKeyWithNsfw = [string, SearchMode, string, number, boolean];

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
  const [showNSFW, setShowNSFW] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/profile/nsfw`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setShowNSFW(Boolean(json?.show_nsfw));
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const prefetchNextPage = async () => {
    await queryClient.prefetchQuery({
      queryFn: fetchSearchMovie,
      queryKey: [
        "searchMovie",
        currentType,
        query,
        page + 1,
        showNSFW,
      ] as SearchQueryKeyWithNsfw,
    });
  };
  const fetchSearchMovie = async ({
    queryKey,
  }: {
    queryKey: SearchQueryKeyWithNsfw;
  }) => {
    const [, activeType, searchQuery, searchPage, nsfwFlag] = queryKey;
    const includeAdult = nsfwFlag === true;
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(searchQuery)}&type=${activeType}&page=${searchPage}&include_adult=${includeAdult ? "true" : "false"}`,
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
    queryKey: [
      "searchMovie",
      currentType,
      query,
      page,
      showNSFW,
    ] as SearchQueryKeyWithNsfw,
  });

  // persist user selection when logged in
  useEffect(() => {
    if (typeof window === "undefined") return;
    (async () => {
      try {
        await fetch(`/api/profile/nsfw`, {
          method: "POST",
          body: JSON.stringify({ show_nsfw: showNSFW }),
        });
      } catch {
        // ignore
      }
    })();
  }, [showNSFW]);

  useEffect(() => {
    if (!isSuccess) return;
    prefetchNextPage();
  }, [isSuccess, query, page, currentType]);

  return (
    <RenderUi query={query}>
      <SearcMovieNavigation
        data={data}
        query={query}
        activeType={currentType}
        onTypeChange={(nextType) => {
          router.push(`/search/${encodeURIComponent(query)}?type=${nextType}`);
        }}
        isLoading={isLoading}
        showNSFW={showNSFW}
        onNSFWChange={setShowNSFW}
      />
      {isLoading ? (
        <div className="relative mt-10 grid w-full grid-cols-5 items-center gap-5 xxl:grid-cols-4 ds:grid-cols-3 lg:grid-cols-3 xssmd:grid-cols-2 smd:grid-cols-2 s:grid-cols-1">
          {Array.from({ length: 10 }, (_, index) => (
            <MovieSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : data && data.results.length === 0 ? (
        <NoResults />
      ) : data ? (
        <SearchMoviesDisplay data={data} showNSFW={showNSFW} />
      ) : null}
    </RenderUi>
  );
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
