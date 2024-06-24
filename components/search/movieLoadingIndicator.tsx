import MovieSkeleton from "@/components/general/movieSkeleton";
import { SearchVanishComp } from "@/components/search/searchVanishComp";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";

export default function MovieLoadingIndicator({}) {
  return (
    <div className="mx-auto mt-20 w-[90%]">
      <SearchVanishComp />
      <div className="mx-auto mt-12 w-[97%]">
        <div className="flex justify-between">
          <h2 className="text-lg">
            Found: <span className="font-bold text-primaryM-500">100</span>{" "}
            results
          </h2>
          <div className="flex items-center justify-center gap-3">
            <span>1-1</span>
            <span className="flex items-center justify-center gap-1">
              <button
                disabled={true}
                className="cursor-pointer bg-[#675720] p-2"
              >
                <ArrowLeftToLine />
              </button>
              <button className="cursor-pointer bg-yellow-500 p-2" disabled>
                <ArrowRightToLine />
              </button>
            </span>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-5 gap-5">
        {Array.from({ length: 10 }, (_, index) => (
          <MovieSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
