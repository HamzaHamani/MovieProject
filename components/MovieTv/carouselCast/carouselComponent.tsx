import LazyBlurImage from "@/components/ui/lazyBlurImage";
import { ReactNode } from "react";
import Link from "next/link";

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

export function CarouselComponent({
  title,
  subtitle,
  people,
  variant = "cast",
}: Props) {
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

      <div className="hide-scrollbar mt-4 overflow-x-auto pb-2">
        <div
          className={`grid gap-3 ${
            variant === "cast"
              ? "grid-flow-col auto-cols-[156px] sm:auto-cols-[142px]"
              : "grid-flow-col auto-cols-[220px] sm:auto-cols-[198px]"
          }`}
        >
          {people.map((person, index) => (
            <Link
              href={`/crew/${person.id}`}
              key={`${person.id}-${index}`}
              className={`group rounded-2xl border border-white/10 bg-black/20 p-3 transition duration-300 hover:-translate-y-1 hover:border-primaryM-500/35 hover:bg-white/[0.06] ${
                variant === "cast" ? "space-y-3" : "flex gap-3"
              }`}
            >
              <div
                className={`overflow-hidden bg-white/10 ${
                  variant === "cast"
                    ? "aspect-[4/5] rounded-2xl"
                    : "h-16 w-16 shrink-0 rounded-2xl"
                }`}
              >
                {person.profile_path ? (
                  <LazyBlurImage
                    src={`https://image.tmdb.org/t/p/w500/${person.profile_path}`}
                    alt={person.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    placeholderClassName="bg-zinc-300/70"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-zinc-300 text-[10px] text-zinc-700">
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
          ))}
        </div>
      </div>
    </section>
  );
}
