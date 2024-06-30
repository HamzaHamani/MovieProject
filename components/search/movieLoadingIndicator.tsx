import MovieSkeleton from "@/components/general/movieSkeleton";
import { SearchVanishComp } from "@/components/search/searchVanishComp";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";

export default function MovieLoadingIndicator({}) {
  return (
    <div className="mx-auto mt-20 w-[90%]">
      <SearchVanishComp />
      <div className="mx-auto mt-12 w-[97%]">
        <div className="flex items-center justify-between lg:text-sm">
          <h2 className="text-lg lg:text-base">
            Found: <span className="font-bold text-primaryM-500">100</span>{" "}
            results
          </h2>
          <div className="flex items-center justify-center gap-3">
            <span>1-1</span>
            <span className="flex items-center justify-center gap-1">
              <button
                disabled={true}
                className="cursor-pointer bg-[#675720] p-2 lg:p-1.5 lg:px-2"
              >
                <ArrowLeftToLine className="lg:w-5" />
              </button>
              <button
                className="cursor-pointer bg-yellow-500 p-2 lg:p-1.5 lg:px-2"
                disabled
              >
                <ArrowRightToLine className="lg:w-5" />
              </button>
            </span>
          </div>
        </div>
      </div>
      <div className="ds:grid-cols-3 xssmd:grid-cols-2 relative mt-10 grid w-full grid-cols-5 items-center gap-5 xxl:grid-cols-4 lg:grid-cols-3 smd:grid-cols-2 s:grid-cols-1">
        {Array.from({ length: 10 }, (_, index) => (
          <MovieSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
