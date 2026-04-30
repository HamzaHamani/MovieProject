"use client";

import { useState, useEffect } from "react";
import { stopInternalLoad } from "@/components/ui/loadingBus";
import { TImageItem } from "@/lib/actions";
import LazyBlurImage from "../ui/lazyBlurImage";

type Props = {
  items: TImageItem[];
};

export default function ImagesSection({ items }: Props) {
  useEffect(() => {
    stopInternalLoad();
  }, []);
  const [visibleCount, setVisibleCount] = useState(6);
  const list = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <section className="mt-10">
      <h3 className="mb-5 text-3xl font-medium xl:text-2xl smd:text-xl">
        Images
      </h3>

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#101018] p-4 text-sm text-gray-300">
          No images available yet on TMDB for this title.
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-3 gap-3 xl:grid-cols-2 md:grid-cols-2 s:grid-cols-1">
            {list.map((image, index) => {
              const imageUrl = `https://image.tmdb.org/t/p/w780${image.file_path}`;
              const fullImageUrl = `https://image.tmdb.org/t/p/original${image.file_path}`;

              return (
                <a
                  key={`${image.file_path}-${index}`}
                  href={fullImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-xl border border-white/10 bg-[#101018]"
                >
                  <div className="aspect-[16/9] w-full">
                    <LazyBlurImage
                      src={imageUrl}
                      alt={`Still image ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      placeholderClassName="bg-zinc-700/45"
                    />
                  </div>
                </a>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-primaryM-500 underline underline-offset-4 transition hover:text-primaryM-400"
                onClick={() => setVisibleCount((prev) => prev + 6)}
              >
                Show more
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
