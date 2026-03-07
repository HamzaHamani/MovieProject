import { Skeleton } from "@/components/ui/skeleton";

export default function CreditsSectionSkeleton({ title }: { title: string }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Skeleton className="h-5 w-24 bg-white/10" />
      </div>

      <div className="grid grid-cols-4 gap-4 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 s:grid-cols-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={`${title}-skeleton-${index}`} className="space-y-2">
            <Skeleton className="h-[430px] w-[300px] rounded-xl bg-white/10 xl:h-[430px] xl:w-[280px] lg:h-[390px] lg:w-[270px] h1text8:h-[360px] h1text8:w-[240px] xsmd:h-[390px] xsmd:w-[270px] smd:h-[330px] smd:w-[230px] sss:h-[320px] sss:w-[210px] s:h-[350px] s:w-[230px]" />
          </div>
        ))}
      </div>
    </section>
  );
}
