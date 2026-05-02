import Link from "next/link";
import { GrDocumentMissing } from "react-icons/gr";
import { RiStarSFill } from "react-icons/ri";

import LazyBlurImage from "@/components/ui/lazyBlurImage";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  posterPath: string | null;
  title: string;
  voteAverage: number | null | undefined;
  mediaTypeLabel: "Film" | "Movie" | "TV Show" | "TV";
  year: string;
  className?: string;
  imageClassName?: string;
};

export default function MovieTvCard({
  href,
  posterPath,
  title,
  voteAverage,
  mediaTypeLabel,
  year,
  className,
  imageClassName,
}: Props) {
  return (
    <Link
      href={href}
      className={cn("group block w-full overflow-hidden rounded-xl", className)}
    >
      <div
        className={cn(
          "relative h-[360px] w-full overflow-hidden rounded-xl xl:h-[330px] lg:h-[300px] h1text8:h-[280px] smd:h-[250px] sss:h-[230px] s:h-[250px]",
          posterPath ? "" : "bg-gray-600",
          imageClassName,
        )}
      >
        {posterPath ? (
          <LazyBlurImage
            src={`https://image.tmdb.org/t/p/w500/${posterPath}`}
            alt={`${title} poster`}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110"
            placeholderClassName="bg-zinc-700/50"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <GrDocumentMissing className="text-4xl smd:text-3xl sss:text-2xl" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/10" />

        <div className="absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-black via-black/80 to-transparent p-3 smd:p-2.5 sss:p-2">
          <h3 className="line-clamp-1 text-base font-semibold lg:text-sm smd:text-[13px] sss:text-xs">
            {title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-200 smd:gap-1.5 smd:text-[11px] sss:text-[10px]">
            <span className="flex items-center gap-1">
              <RiStarSFill className="text-sm text-primaryM-500 smd:text-xs sss:text-[10px]" />
              {typeof voteAverage === "number" ? voteAverage.toFixed(1) : "--"}
            </span>
            <span>•</span>
            <span>{mediaTypeLabel}</span>
            <span>•</span>
            <span>{year || "----"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
