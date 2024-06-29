import { TsearchMovie } from "@/types/api";
import ArrowButtons from "./arrowButtons";
import usePage from "@/hooks/usePage";
import NavigationPage from "./navigationPage";

type Props = {
  data: TsearchMovie;
};

export default function SearcMovieNavigation({ data }: Props) {
  return (
    <>
      <div className="mx-auto mt-12 w-[97%]">
        <div className="flex items-center justify-between lg:text-sm">
          <h2 className="text-lg lg:text-base">
            Found:{" "}
            <span className="font-bold text-primaryM-500">
              {data.total_results}
            </span>{" "}
            results
          </h2>
          <div className="flex items-center justify-center gap-3">
            <NavigationPage data={data} />
            <span className="flex items-center justify-center gap-1">
              <ArrowButtons data={data} />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
