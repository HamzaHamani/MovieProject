import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container pb-10 pt-96 text-textMain lg:pt-64 sm:pt-48">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-5 sm:p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="mt-24 h-20 w-20 rounded-full bg-white/15" />
          <div className="space-y-2">
            <Skeleton className="mt-24 h-8 w-52 bg-white/20" />
            <Skeleton className="mt-24 h-4 w-40 bg-white/15" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 lg:grid-cols-2 sm:grid-cols-1">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton
              key={`profile-stat-${idx}`}
              className="bg-white/12 mt-24 h-28 rounded-2xl"
            />
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-5 sm:p-4">
        <Skeleton className="mt-24 h-6 w-48 bg-white/15" />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-1">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton
              key={`profile-row-${idx}`}
              className="mt-24 h-44 rounded-2xl bg-white/10"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
