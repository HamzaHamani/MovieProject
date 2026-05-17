import WholeDisplay from "@/components/tv/WholeDisplay";
import { getSimilarByType, getSpecifiedTV } from "@/lib/actions";
import { TspecifiedTv } from "@/types/apiTv";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_URL, SITE_NAME } from "@/config/site";
import { generatePageMetadata } from "@/lib/seo-utils";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  async function fetchTV(): Promise<TspecifiedTv> {
    try {
      const data = await getSpecifiedTV(id);
      return data as TspecifiedTv;
    } catch (e) {
      return {
        id: 0,
        name: "TV Show",
        overview: "TV Show details",
      } as TspecifiedTv;
    }
  }

  const show = await fetchTV();
  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w1280${show.poster_path}`
    : DEFAULT_OG_IMAGE;

  const releaseYear = show.first_air_date
    ? new Date(show.first_air_date).getFullYear()
    : undefined;

  const shortDescription = show.overview?.trim()
    ? `${show.overview.slice(0, 150)}${show.overview.length > 150 ? "..." : ""}`
    : `Discover details about ${show.name} on ${SITE_NAME}`;

  return generatePageMetadata({
    title: show.name || "TV Show",
    description: shortDescription,
    canonical: `${SITE_URL}/tv/${id}`,
    ogImage: posterUrl,
    ogType: "website",
  });
}

export default async function page({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  async function fetch(): Promise<TspecifiedTv> {
    try {
      const data: TspecifiedTv = await getSpecifiedTV(id);
      return data;
    } catch (e) {
      notFound();
    }
  }
  const [response, similar] = await Promise.all([
    fetch(),
    getSimilarByType(id, "tv"),
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
    normalizedTab === "videos" ||
    normalizedTab === "images" ||
    normalizedTab === "providers"
      ? normalizedTab
      : "videos";

  const rawSeason = resolvedSearchParams?.season;
  const seasonValue = Array.isArray(rawSeason) ? rawSeason[0] : rawSeason;
  const parsedSeason = seasonValue ? Number.parseInt(seasonValue, 10) : NaN;
  const selectedSeason =
    Number.isInteger(parsedSeason) && parsedSeason > 0 ? parsedSeason : null;

  const rawEpisode = resolvedSearchParams?.episode;
  const episodeValue = Array.isArray(rawEpisode) ? rawEpisode[0] : rawEpisode;
  const parsedEpisode = episodeValue ? Number.parseInt(episodeValue, 10) : NaN;
  const selectedEpisode =
    Number.isInteger(parsedEpisode) && parsedEpisode > 0 ? parsedEpisode : null;

  return (
    <WholeDisplay
      response={response}
      similar={similar}
      activeTab={tab}
      selectedSeason={selectedSeason}
      selectedEpisode={selectedEpisode}
    />
  );
}
