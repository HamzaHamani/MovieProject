import { Skeleton } from "../ui/skeleton";

type Props = {};

export default function ReviewsLoadingIndicator({}: Props) {
  return (
    <section className="mt-10">
      <h3 className="mb-5 text-3xl font-medium xl:text-2xl smd:text-xl">
        Reviews
      </h3>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={`reviews-loading-${idx}`}
            className="rounded-xl border border-white/10 bg-[#101018] p-4"
          >
            <Skeleton className="mb-3 h-4 w-1/3 bg-white/10" />
            <Skeleton className="mb-2 h-3 w-full bg-white/10" />
            <Skeleton className="mb-2 h-3 w-11/12 bg-white/10" />
            <Skeleton className="h-3 w-4/5 bg-white/10" />
          </div>
        ))}
      </div>
    </section>
  );
}
