import { Skeleton } from "../../ui/skeleton";

type Props = {};

export default function CarouselTLoadingIndicator({}: Props) {
  return (
    <div className="grid grid-cols-3 justify-items-center gap-5 xl:grid-cols-2 md:grid-cols-1">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex h-full w-full max-w-[460px] flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"
        >
          <Skeleton className="h-[340px] w-full bg-gray-100/40 xl:h-[300px] lg:h-[270px] md:h-[250px] s:h-[220px]" />

          <div className="flex flex-col gap-3 p-3">
            <Skeleton className="h-4 w-[90%] bg-gray-100/40" />
            <Skeleton className="h-4 w-[70%] bg-gray-100/40" />

            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full bg-gray-100/40" />
                <Skeleton className="h-4 w-24 bg-gray-100/40" />
              </div>
              <Skeleton className="h-7 w-14 rounded-md bg-gray-100/40" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
