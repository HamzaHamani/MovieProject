import { Skeleton } from "../ui/skeleton";

type Props = {};

export default function ImagesLoadingIndicator({}: Props) {
  return (
    <section className="mt-10">
      <h3 className="mb-5 text-3xl font-medium xl:text-2xl smd:text-xl">
        Images
      </h3>
      <div className="w-ful grid grid-cols-3 gap-3 xl:grid-cols-2 md:grid-cols-2 s:grid-cols-1">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`images-loading-${idx}`}
            className="overflow-hidden rounded-xl border border-white/10 bg-[#101018]"
          >
            <div className="aspect-[16/9] w-full">
              <Skeleton className="h-full w-full rounded-none bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
