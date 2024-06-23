import { TsearchMovie } from "@/types/api";
import ArrowButtons from "./arrowButtons";

type Props = {
  data: TsearchMovie;
};

export default function SearcMovieNavigation({ data }: Props) {
  console.log(data);
  return (
    <div className="mx-auto w-[97%]">
      <div className="flex justify-between">
        <h2 className="text-lg">
          Found:{" "}
          <span className="font-bold text-primaryM-500">
            {data.total_results}
          </span>{" "}
          movies
        </h2>
        <div className="flex items-center justify-center gap-3">
          <span>1-{data?.total_pages}</span>
          <span className="flex items-center justify-center gap-1">
            <ArrowButtons data={data} />
          </span>
        </div>
      </div>
    </div>
  );
}
