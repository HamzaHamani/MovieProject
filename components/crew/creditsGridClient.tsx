"use client";

import { TPersonCreditItem } from "@/lib/actions";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RiStarSFill } from "react-icons/ri";

type Props = {
  title: string;
  items: TPersonCreditItem[];
  emptyText: string;
};

function getCreditTitle(credit: TPersonCreditItem): string {
  return credit.media_type === "movie"
    ? (credit.title ?? "Untitled Movie")
    : (credit.name ?? "Untitled Show");
}

function getCreditYear(credit: TPersonCreditItem): string {
  const date =
    credit.media_type === "movie"
      ? credit.release_date
      : credit.first_air_date;
  return date ? date.slice(0, 4) : "----";
}

const MOVIE_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const TV_GENRES: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

function getCreditGenre(credit: TPersonCreditItem): string {
  if (!credit.genre_ids?.length) return "Unknown";

  const genreMap = credit.media_type === "movie" ? MOVIE_GENRES : TV_GENRES;
  const genreName = genreMap[credit.genre_ids[0]];

  return genreName ?? "Unknown";
}

function getCreditRating(credit: TPersonCreditItem): string {
  return Number.isFinite(credit.vote_average) ? credit.vote_average.toFixed(1) : "--";
}

function buildCreditHref(credit: TPersonCreditItem): string {
  return credit.media_type === "movie"
    ? `/movie/${credit.id}`
    : `/tv/${credit.id}`;
}

export default function CreditsGridClient({ title, items, emptyText }: Props) {
  const [visibleCount, setVisibleCount] = useState(12);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  const hasMore = items.length > visibleCount;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-zinc-400 md:text-xs">{items.length} credits</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-400">{emptyText}</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 s:grid-cols-1">
            {visibleItems.map((credit) => {
              const cardTitle = getCreditTitle(credit);
              const year = getCreditYear(credit);
              const rating = getCreditRating(credit);
              const genre = getCreditGenre(credit);

              return (
                <Link
                  key={`${title}-${credit.media_type}-${credit.id}-${credit.job ?? credit.character ?? ""}`}
                  href={buildCreditHref(credit)}
                  className="group block w-[300px] overflow-hidden rounded-xl xl:w-[280px] lg:w-[270px] h1text8:w-[240px] xsmd:w-[270px] smd:w-[230px] sss:w-[210px] s:w-[230px]"
                >
                  <div className="relative h-[430px] w-full overflow-hidden rounded-xl bg-zinc-800 lg:h-[390px] h1text8:h-[360px] xsmd:h-[390px] smd:h-[330px] sss:h-[320px] s:h-[350px]">
                    {credit.poster_path ? (
                      <LazyBlurImage
                        src={`https://image.tmdb.org/t/p/w500${credit.poster_path}`}
                        alt={cardTitle}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        placeholderClassName="bg-zinc-700/50"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-xs text-zinc-400">
                        No image
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 smd:p-2.5 sss:p-2">
                      <h3 className="line-clamp-1 text-base font-semibold text-white lg:text-sm smd:text-[13px] sss:text-xs">
                        {cardTitle}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-200 smd:gap-1.5 smd:text-[11px] sss:text-[10px]">
                        <span className="flex items-center gap-1">
                          <RiStarSFill className="text-sm text-primaryM-500 smd:text-xs sss:text-[10px]" />
                          {rating}
                        </span>
                        <span>•</span>
                        <span className="line-clamp-1">{genre}</span>
                        <span>•</span>
                        <span>{year}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 21)}
                className="rounded-md bg-primaryM-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-primaryM-300"
              >
                Show more
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
