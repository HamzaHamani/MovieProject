import { TsearchMovie } from "@/types/api";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";

type Props = {
  data: TsearchMovie;
};

export default function SearcMovieNavigation({ data }: Props) {
  console.log(data);
  return (
    <div className="mx-auto w-[97%]">
      <div className="flex justify-between">
        <h2 className="text-lg">
          Found: <span className="font-bold text-primaryM-500">100</span> movies
        </h2>
        <div className="flex items-center justify-center gap-3">
          <span>1-10</span>
          <span className="flex items-center justify-center gap-1">
            <button disabled={true} className="cursor-pointer bg-[#675720] p-2">
              <ArrowLeftToLine />
            </button>
            <button className="cursor-pointer bg-yellow-500 p-2">
              <ArrowRightToLine />
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
