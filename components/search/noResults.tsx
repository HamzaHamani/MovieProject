import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import { SearchVanishComp } from "./searchVanishComp";

type Props = {};

export default function NoResults({}: Props) {
  return (
    <div className="mx-auto mt-20 w-[90%]">
      <SearchVanishComp />
      <div className="mx-auto mt-12 w-[97%]">
        <div className="flex items-center justify-between lg:text-sm">
          <h2 className="text-lg lg:text-base">
            Found: <span className="font-bold text-primaryM-500">0</span>{" "}
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
      <div className="flex h-[65vh] items-center justify-center">
        <h2 className="text-9xl font-extrabold tracking-tighter xl:text-8xl lg:text-7xl xsmd:text-3xl md:text-6xl sss:text-5xl s:text-3xl">
          No Results Found
        </h2>
      </div>
    </div>
  );
}
