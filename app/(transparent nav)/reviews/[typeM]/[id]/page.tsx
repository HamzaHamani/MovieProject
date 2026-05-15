import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import {
  getCategorizedReviewsByType,
  getSpecifiedMovie,
  getSpecifiedTV,
} from "@/lib/actions";
import ReviewsTabs from "@/components/reviews/reviewsTabs";
import { DEFAULT_OG_IMAGE, SITE_URL, SITE_NAME } from "@/config/site";
import { generatePageMetadata } from "@/lib/seo-utils";

type Props = {
  params: Promise<{ typeM: string; id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

function parsePositiveInt(value: string | string[] | undefined, fallback = 1) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { typeM, id } = await params;

  if (typeM !== "movie" && typeM !== "tv") {
    return { title: "Reviews Not Found" };
  }

  try {
    const media =
      typeM === "movie"
        ? await getSpecifiedMovie(id)
        : await getSpecifiedTV(id);

    const title =
      typeM === "movie" ? (media as any).title : (media as any).name;
    const backdrop = media.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${media.backdrop_path}`
      : DEFAULT_OG_IMAGE;
    const description = `Read and discover reviews for ${title} on ${SITE_NAME}. See what others think about this ${typeM === "movie" ? "film" : "TV show"}.`;

    return generatePageMetadata({
      title: `${title} - Reviews`,
      description,
      canonical: `${SITE_URL}/reviews/${typeM}/${id}`,
      ogImage: backdrop,
      ogType: "website",
    });
  } catch (error) {
    return { title: "Reviews" };
  }
}

export default async function ReviewsPage({ params, searchParams }: Props) {
  const { typeM, id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (typeM !== "movie" && typeM !== "tv") {
    notFound();
  }

  const categoryValue = Array.isArray(resolvedSearchParams?.category)
    ? resolvedSearchParams?.category[0]
    : resolvedSearchParams?.category;
  const activeCategory =
    categoryValue === "critic" || categoryValue === "social"
      ? categoryValue
      : "social";

  const socialPage = parsePositiveInt(resolvedSearchParams?.socialPage, 1);
  const criticPage = parsePositiveInt(resolvedSearchParams?.criticPage, 1);

  const [title, backdropPath, socialFeed, criticFeed] = await Promise.all([
    typeM === "movie"
      ? getSpecifiedMovie(id).then((movie) => ({
          title: movie.title ?? "Title",
          backdropPath: movie.backdrop_path ?? null,
        }))
      : getSpecifiedTV(id).then((tv) => ({
          title: tv.name ?? "Title",
          backdropPath: tv.backdrop_path ?? null,
        })),
    getCategorizedReviewsByType({
      id,
      typeM,
      category: "social",
      page: socialPage,
      pageSize: 10,
    }),
    getCategorizedReviewsByType({
      id,
      typeM,
      category: "critic",
      page: criticPage,
      pageSize: 10,
    }),
  ]).then(
    ([media, socialFeedResult, criticFeedResult]) =>
      [
        media.title,
        media.backdropPath,
        socialFeedResult,
        criticFeedResult,
      ] as const,
  );

  const backHref = `/${typeM}/${id}?tab=reviews`;

  return (
    <div className="relative min-h-screen overflow-hidden text-textMain">
      {backdropPath ? (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${backdropPath})`,
          }}
        />
      ) : null}
      <div className="container relative z-10 pb-12 pt-24 sm:pt-20">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
              {typeM === "movie" ? "Film" : "TV Show"} Reviews
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white lg:mt-6 lg:text-2xl sm:mt-2 sm:text-xl">
              {title}
            </h1>
          </div>

          <Link
            href={backHref}
            className="rounded-lg border border-white/20 bg-white/[0.03] px-3 py-2 text-sm text-white transition hover:bg-white/[0.08]"
          >
            Back to title
          </Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 lg:p-4 sm:p-3">
          <ReviewsTabs
            typeM={typeM}
            id={id}
            socialFeed={socialFeed}
            criticFeed={criticFeed}
            initialCategory={activeCategory}
            socialPage={socialPage}
            criticPage={criticPage}
          />
        </section>
      </div>
    </div>
  );
}
