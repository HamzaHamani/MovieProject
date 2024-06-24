"use client";
import { TsearchMovie } from "@/types/api";
import ArrowButtons from "./arrowButtons";
import usePage from "@/hooks/usePage";

type Props = {
  data: TsearchMovie;
};

export default function SearcMovieNavigation({ data }: Props) {
  const { page } = usePage();
  return (
    <>
      <div className="mx-auto mt-12 w-[97%]">
        <div className="flex justify-between">
          <h2 className="text-lg">
            Found:{" "}
            <span className="font-bold text-primaryM-500">
              {data.total_results}
            </span>{" "}
            results
          </h2>
          <div className="flex items-center justify-center gap-3">
            <span>
              {page}-{data?.total_pages}
            </span>
            <span className="flex items-center justify-center gap-1">
              <ArrowButtons data={data} />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
