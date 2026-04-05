import LoadingIndicator from "@/components/general/loadingIndicator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#05060b] text-white">
      <section className="mx-auto w-[94%] pb-8 pt-20">
        <div className="mb-8 rounded-xl border border-white/15 p-4">
          <Skeleton className="h-[200px] w-full rounded-lg bg-white/10" />
          <Skeleton className="mt-4 h-8 w-[55%] bg-white/15" />
          <Skeleton className="mt-2 h-4 w-[70%] bg-white/10" />
        </div>

        <div className="grid grid-cols-4 justify-items-center gap-3 lg:grid-cols-2 smd:grid-cols-1">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Skeleton
              key={`upcoming-skeleton-${idx}`}
              className="h-[430px] w-[300px] rounded-xl bg-white/10"
            />
          ))}
        </div>

        <div className="mt-6">
          <LoadingIndicator />
        </div>
      </section>
    </main>
  );
}
