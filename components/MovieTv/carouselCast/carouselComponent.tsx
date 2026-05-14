import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import LazyBlurImage from "@/components/ui/lazyBlurImage";
import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  people: Array<{
    id: number;
    name: string;
    profile_path?: string | null;
    subtitle?: ReactNode;
  }>;
  variant?: "cast" | "crew";
};

export function CarouselComponent({ title, subtitle, people }: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-4">
      <div className="flex items-end justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <h4 className="text-xl font-semibold tracking-tight text-textMain xl:text-lg">
            {title}
          </h4>
          {subtitle ? (
            <p className="text-sm text-textMain/70 sm:text-xs">{subtitle}</p>
          ) : null}
        </div>
        <span className="rounded-full border border-primaryM-500/30 bg-primaryM-500/10 px-3 py-1 text-xs font-medium text-primaryM-100">
          {people.length}
        </span>
      </div>

      <div className="relative mt-4">
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="gap-3">
            {people.map((person, index) => (
              <CarouselItem
                key={`${person.id}-${index}`}
                className="basis-1/6 pl-0 xl:basis-1/5 lg:basis-1/4 md:basis-1/3 sm:basis-1/2 s:basis-64"
              >
                <Link
                  href={`/crew/${person.id}`}
                  className="group flex h-full w-full flex-col space-y-3 rounded-2xl border border-white/10 bg-black/20 p-3 transition duration-300 hover:-translate-y-1 hover:border-primaryM-500/35 hover:bg-white/[0.06]"
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-white/10">
                    {person.profile_path ? (
                      <LazyBlurImage
                        src={`https://image.tmdb.org/t/p/w500/${person.profile_path}`}
                        alt={person.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        placeholderClassName="bg-zinc-300/70"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-white/5 to-black/20 text-[10px] text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="line-clamp-1 text-sm font-semibold text-textMain sm:text-[13px]">
                      {person.name}
                    </h3>
                    {person.subtitle ? (
                      <p className="line-clamp-2 text-xs leading-relaxed text-textMain/70">
                        {person.subtitle}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="absolute bottom-3 right-3 flex gap-2">
            <CarouselPrevious className="h-9 w-9 border border-white/20 bg-white/5 text-textMain transition hover:border-primaryM-500/50 hover:bg-white/10 hover:text-primaryM-500 disabled:opacity-40" />
            <CarouselNext className="h-9 w-9 border border-white/20 bg-white/5 text-textMain transition hover:border-primaryM-500/50 hover:bg-white/10 hover:text-primaryM-500 disabled:opacity-40" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
