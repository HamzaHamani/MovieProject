import LoadingIndicator from "@/components/general/loadingIndicator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container pb-12 pt-8 text-textMain">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 bg-white/15" />
          <Skeleton className="h-9 w-72 bg-white/20" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg bg-white/15" />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 lg:p-4 sm:p-3">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-2">
          <div className="flex gap-6">
            <Skeleton className="h-6 w-32 bg-white/15" />
            <Skeleton className="h-6 w-32 bg-white/15" />
          </div>
          <Skeleton className="h-9 w-24 rounded-lg bg-white/15" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`reviews-page-skeleton-${index}`}
              className="rounded-xl border border-white/10 bg-[#101018] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-4 w-28 bg-white/15" />
                <Skeleton className="h-3 w-20 bg-white/15" />
              </div>
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="mt-2 h-4 w-[90%] bg-white/10" />
              <Skeleton className="mt-2 h-4 w-[75%] bg-white/10" />
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6">
        <LoadingIndicator />
      </div>
    </div>
  );
}
