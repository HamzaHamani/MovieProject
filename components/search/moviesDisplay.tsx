"use client";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import type { SearchResult, TsearchApiResponse } from "@/types/api";

import MovieTvCard from "../general/movieTvCard";

type Props = {
  data: TsearchApiResponse;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function PersonCard({ result }: { result: SearchResult }) {
  return (
    <Link
      href={result.href}
      className="group block w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-primaryM-500/50 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
        {result.imagePath ? (
          <LazyBlurImage
            src={`https://image.tmdb.org/t/p/w500${result.imagePath}`}
            alt={result.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            placeholderClassName="bg-zinc-800/70"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-white/[0.03] text-sm text-gray-500">
            No image
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-1 text-base font-semibold text-white">
            {result.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-gray-300">
            {result.subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
}

function UserCard({ result }: { result: SearchResult }) {
  return (
    <Link
      href={result.href}
      className="group block w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-primaryM-500/50 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
        {result.imagePath ? (
          <LazyBlurImage
            src={result.imagePath}
            alt={result.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            placeholderClassName="bg-zinc-800/70"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-white/[0.03] text-sm text-gray-500">
            <Avatar className="h-20 w-20 border border-white/15 bg-white/10">
              <AvatarFallback className="bg-white/10 text-xl text-white">
                {getInitials(result.title)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-1 text-base font-semibold text-white">
            {result.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-gray-300">
            {result.username ? `@${result.username}` : result.subtitle}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-gray-300/95">
            {result.bio || "No bio yet."}
          </p>
          <p className="mt-1 text-[11px] font-medium text-primaryM-300">
            Community profile
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function SearchMoviesDisplay({ data }: Props) {
  return (
    <div className="relative mt-10 grid w-full grid-cols-5 items-start justify-items-center gap-5 xxl:grid-cols-4 ds:grid-cols-3 lg:grid-cols-3 xssmd:grid-cols-2 smd:grid-cols-2 s:grid-cols-1">
      {data.results.map((result) => {
        if (result.kind === "user") {
          return <UserCard key={result.id} result={result} />;
        }

        if (result.kind === "person") {
          return <PersonCard key={result.id} result={result} />;
        }

        return (
          <MovieTvCard
            key={result.id}
            href={result.href}
            posterPath={result.imagePath}
            title={result.title}
            voteAverage={result.voteAverage}
            mediaTypeLabel={result.mediaLabel as "Film" | "TV Show" | "TV"}
            year={result.year || "----"}
            className="w-full max-w-[340px] self-center xl:max-w-[310px] lg:max-w-[280px] h1text8:max-w-[250px] smd:max-w-[220px] sss:max-w-[200px] s:max-w-[210px]"
            imageClassName="h-[550px] xl:h-[430px] lg:h-[390px] h1text8:h-[400px] xsmd:h-[450px] smd:h-[350px] sss:h-[330px] s:h-[370px]"
          />
        );
      })}
    </div>
  );
}
