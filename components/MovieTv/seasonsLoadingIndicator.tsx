import { Skeleton } from "../ui/skeleton";

type Props = {
  showEpisodesTitle?: boolean;
  title?: string;
};

export default function SeasonsLoadingIndicator({
  showEpisodesTitle = false,
  title,
}: Props) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-3xl font-medium xl:text-2xl smd:text-xl">
          {title ?? (showEpisodesTitle ? "Seasons / Episodes" : "Seasons")}
        </h3>
        <Skeleton className="h-7 w-20 bg-white/10" />
      </div>

      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`seasons-loading-${idx}`}
            className="basis-[280px] shrink-0 pl-4 xl:basis-[250px] lg:basis-[220px] h1text8:basis-[200px] smd:basis-[180px] sss:basis-[165px] s:basis-[175px]"
          >
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#101018]">
              <Skeleton className="h-[360px] w-full rounded-none bg-white/10 xl:h-[330px] lg:h-[300px] h1text8:h-[280px] smd:h-[250px] sss:h-[230px] s:h-[250px]" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <Skeleton className="mb-2 h-4 w-2/3 bg-white/20" />
                <Skeleton className="h-3 w-1/2 bg-white/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
