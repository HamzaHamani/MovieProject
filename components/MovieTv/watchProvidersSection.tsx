"use client";

import { TWatchProvidersData } from "@/lib/actions";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import LazyBlurImage from "@/components/ui/lazyBlurImage";

type Props = {
  providers: TWatchProvidersData;
};

type CategoryKey = "flatrate" | "rent" | "buy";

type CategoryConfig = {
  key: CategoryKey;
  title: string;
  emptyLabel: string;
};

const categories: CategoryConfig[] = [
  {
    key: "flatrate",
    title: "Stream",
    emptyLabel: "No streaming providers available.",
  },
  {
    key: "rent",
    title: "Rent",
    emptyLabel: "No rental providers available.",
  },
  {
    key: "buy",
    title: "Buy",
    emptyLabel: "No purchase providers available.",
  },
];

export default function WatchProvidersSection({ providers }: Props) {
  const hasAnyProvider =
    providers.flatrate.length > 0 ||
    providers.rent.length > 0 ||
    providers.buy.length > 0;

  return (
    <section className="mt-10">
      <h3 className="mb-5 text-3xl font-medium xl:text-2xl smd:text-xl">
        Watch Providers
      </h3>

      {!hasAnyProvider ? (
        <div className="rounded-xl border border-white/10 p-4 text-sm text-gray-300">
          No watch providers are currently listed for this title.
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const items = providers[category.key];

            return (
              <article
                key={category.key}
                className="rounded-xl border border-white/10 p-4"
              >
                <h4 className="mb-4 text-lg font-semibold text-white">
                  {category.title}
                </h4>

                {items.length === 0 ? (
                  <p className="text-sm text-gray-300">{category.emptyLabel}</p>
                ) : (
                  <Carousel
                    opts={{
                      align: "start",
                      dragFree: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-3">
                      {items.map((provider) => {
                        const logoSrc = provider.logo_path
                          ? `https://image.tmdb.org/t/p/w185${provider.logo_path}`
                          : null;

                        return (
                          <CarouselItem
                            key={`${category.key}-${provider.provider_id}`}
                            className="basis-[180px] pl-3 xds:basis-[170px] s:basis-[150px]"
                          >
                            <article className="h-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
                              <div className="aspect-square w-full bg-black/30">
                                {logoSrc ? (
                                  <LazyBlurImage
                                    src={logoSrc}
                                    alt={provider.provider_name}
                                    className="h-full w-full object-cover"
                                    placeholderClassName="bg-zinc-700/45"
                                  />
                                ) : (
                                  <div className="grid h-full w-full place-items-center text-xs text-zinc-400">
                                    No logo
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2 p-3">
                                <p className="line-clamp-2 min-h-10 text-sm font-medium text-white">
                                  {provider.provider_name}
                                </p>
                              </div>
                            </article>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>

                    <div className="mt-4 flex justify-end gap-2">
                      <CarouselPrevious className="static translate-y-0 border-white/20 bg-black/40 text-white hover:bg-black/60" />
                      <CarouselNext className="static translate-y-0 border-white/20 bg-black/40 text-white hover:bg-black/60" />
                    </div>
                  </Carousel>
                )}
              </article>
            );
          })}

          {providers.link && (
            <div className="flex justify-end">
              <a
                href={providers.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primaryM-400 underline underline-offset-4 transition hover:text-primaryM-300"
              >
                View all provider details
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
