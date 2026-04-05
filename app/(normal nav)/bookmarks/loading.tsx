import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mt-5 space-y-6 pb-10 text-textMain">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 lg:p-6 md:p-5 sm:p-4">
        <Skeleton className="h-12 w-56 bg-white/20" />
        <Skeleton className="mt-3 h-5 w-[70%] bg-white/15" />

        <div className="mt-7 grid grid-cols-3 gap-2 lg:grid-cols-2 sm:grid-cols-1">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton
              key={`bookmarks-stat-${idx}`}
              className="bg-white/12 h-36 rounded-2xl"
            />
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg bg-white/15" />
          <Skeleton className="h-10 w-32 rounded-lg bg-white/15" />
        </div>
      </section>

      {Array.from({ length: 2 }).map((_, section) => (
        <section
          key={`bookmarks-list-${section}`}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-52 bg-white/15" />
            <Skeleton className="h-4 w-16 bg-white/15" />
          </div>
          <div className="grid grid-cols-5 gap-3 xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 s:grid-cols-1">
            {Array.from({ length: 5 }).map((_, card) => (
              <Skeleton
                key={`bookmarks-card-${section}-${card}`}
                className="h-[300px] rounded-xl bg-white/10"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
