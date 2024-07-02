import { Skeleton } from "../ui/skeleton";

type Props = {};

export default function CarouselLoadingIndicator({}: Props) {
  return (
    <div className="mx-auto w-[90%]">
      <div className="xdss:grid-cols-5 Ctex6:grid-cols-4 grid grid-cols-6 justify-between gap-5 h1text8:grid-cols-3 ss:grid-cols-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            className={`bg-re-500 p1 flex w-[300px] gap-2 ${index >= 2 && index < 4 ? "hide-item" : ""}`}
            key={index}
          >
            <Skeleton className="h-[80px] w-[80px] overflow-hidden rounded-full bg-white xds:h-[70px] xds:w-[70px] lg:h-[65px] lg:w-[65px] s:h-[50px] s:w-[50px]" />
            <div className="flex flex-col items-start justify-center gap-2">
              <Skeleton className="h-2 w-[100px] rounded bg-gray-200 text-xl h1text2:text-base h1text8:text-sm" />
              <Skeleton className="h-2 w-[60px] rounded bg-gray-200 text-xl h1text2:text-base h1text8:text-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
