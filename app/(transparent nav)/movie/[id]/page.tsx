import WholeDisplay from "@/components/movie/wholeDisplay";
import { getSimilarByType, getSpecifiedMovie } from "@/lib/actions";
import { TspecifiedMovie } from "@/types/api";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, SITE_NAME } from "@/config/site";
import { generatePageMetadata } from "@/lib/seo-utils";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  async function fetchMovie(): Promise<TspecifiedMovie> {
    try {
      const data = await getSpecifiedMovie(id);
      return data as TspecifiedMovie;
    } catch (e) {
      return {
        id: 0,
        title: "Movie",
        overview: "Movie details",
      } as TspecifiedMovie;
    }
  }

  const movie = await fetchMovie();
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}`
    : `${SITE_URL}/og-image.jpg`;

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : undefined;

  return generatePageMetadata({
    title: movie.title || "Movie",
    description:
      movie.overview || `Discover details about ${movie.title} on ${SITE_NAME}`,
    canonical: `${SITE_URL}/movie/${id}`,
    ogImage: posterUrl,
    ogType: "website",
  });
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  async function fetchMovie(): Promise<TspecifiedMovie> {
    try {
      const data = await getSpecifiedMovie(id);
      return data as TspecifiedMovie;
    } catch (e) {
      notFound();
    }
  }

  const [response, similar] = await Promise.all([
    fetchMovie(),
    getSimilarByType(id, "movie"),
  ]);

  const rawTab = resolvedSearchParams?.tab;
  const tabValue = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  const normalizedTab =
    tabValue === "universe"
      ? "videos"
      : tabValue === "news"
        ? "images"
        : tabValue;
  const tab =
    normalizedTab === "reviews" ||
    normalizedTab === "videos" ||
    normalizedTab === "images" ||
    normalizedTab === "providers"
      ? normalizedTab
      : "reviews";

  return (
    <WholeDisplay
      response={response}
      similar={similar}
      activeTab={tab}
      typeM={"movie"}
    />
  );
}
