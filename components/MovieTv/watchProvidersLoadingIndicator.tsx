import { Skeleton } from "../ui/skeleton";

const rows = ["Stream", "Rent", "Buy"];

export default function WatchProvidersLoadingIndicator() {
  return (
    <section className="mt-10">
      <h3 className="mb-5 text-3xl font-medium xl:text-2xl smd:text-xl">
        Watch Providers
      </h3>

      <div className="space-y-6">
        {rows.map((title) => (
          <article
            key={title}
            className="rounded-xl border border-white/10 p-4"
          >
            <h4 className="mb-4 text-lg font-semibold text-white">{title}</h4>
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`${title}-providers-loading-${idx}`}
                  className="w-[180px] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] xds:w-[170px] s:w-[150px]"
                >
                  <Skeleton className="aspect-square w-full bg-white/10" />
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-4 w-4/5 bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
