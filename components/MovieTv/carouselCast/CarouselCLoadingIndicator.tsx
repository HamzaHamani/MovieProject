import { Skeleton } from "../../ui/skeleton";
type Props = {};

export default function CarouselCLoadingIndicator({}: Props) {
  return (
    <div className="space-y-8">
      {Array.from({ length: 2 }, (_, sectionIndex) => (
        <section
          key={sectionIndex}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-4"
        >
          <div className="flex items-end justify-between gap-3 border-b border-white/10 pb-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40 rounded bg-white/15" />
              <Skeleton className="h-3 w-56 rounded bg-white/10" />
            </div>
            <Skeleton className="h-7 w-12 rounded-full bg-white/10" />
          </div>

          <div className="hide-scrollbar mt-4 overflow-x-auto pb-2">
            <div className="grid grid-flow-col auto-cols-[156px] gap-3 sm:auto-cols-[142px]">
              {Array.from({ length: sectionIndex === 0 ? 6 : 5 }, (_, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border border-white/10 bg-black/20 p-3 ${
                    sectionIndex === 0 ? "space-y-3" : "flex gap-3"
                  }`}
                >
                  <Skeleton
                    className={`bg-white/10 ${
                      sectionIndex === 0
                        ? "aspect-[4/5] w-full rounded-2xl"
                        : "h-16 w-16 shrink-0 rounded-2xl"
                    }`}
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-24 rounded bg-white/10" />
                    <Skeleton className="h-3 w-full rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
