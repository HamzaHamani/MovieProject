import { Button } from "@/components/ui/button";
import usePage from "@/hooks/usePage";
import type { SearchMode, TsearchApiResponse } from "@/types/api";
import ArrowButtons from "./arrowButtons";
import NavigationPage from "./navigationPage";

type Props = {
  data: TsearchApiResponse;
  query: string;
  activeType: SearchMode;
  onTypeChange: (type: SearchMode) => void;
};

const filters: Array<{ label: string; value: SearchMode }> = [
  { label: "All", value: "all" },
  { label: "Films", value: "film" },
  { label: "TV Shows", value: "tv" },
  { label: "People", value: "person" },
];

export default function SearcMovieNavigation({
  data,
  query,
  activeType,
  onTypeChange,
}: Props) {
  const { setPage } = usePage();

  return (
    <>
      <div className="mx-auto mt-12 w-[97%] space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              onClick={() => {
                setPage(1);
                onTypeChange(filter.value);
              }}
              variant={activeType === filter.value ? "default" : "outline"}
              className={`h-9 rounded-full px-4 text-sm font-medium ${
                activeType === filter.value
                  ? "bg-primaryM-500 text-black hover:bg-primaryM-600"
                  : "border-white/15 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 lg:text-sm">
          <h2 className="text-lg lg:text-base">
            Found:{" "}
            <span className="font-bold text-primaryM-500">
              {data.total_results}
            </span>{" "}
            results for <span className="text-white">{query}</span>
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
