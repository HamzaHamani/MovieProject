import WholeDisplay from "@/components/tv/WholeDisplay";
import { getSimilarByType, getSpecifiedTV } from "@/lib/actions";
import { TspecifiedTv } from "@/types/apiTv";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { id } = params;
//   async function fetchMovie(): Promise<TspecifiedTv> {
//     try {
//       const data = await getSpecifiedTV(id);

//       return data as TspecifiedTv;
//     } catch (e) {
//       throw new Error("Failed to fetch the movie");
//     }
//   }
//   const res = await fetchMovie();
//   return {
//     title: res.name,
//     description: res.overview,
//   };
// }
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
    normalizedTab === "seasons" ||
    normalizedTab === "videos" ||
    normalizedTab === "images" ||
    normalizedTab === "reviews" ||
    normalizedTab === "providers"
      ? normalizedTab
      : "seasons";

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
      selectedSeason={tab === "seasons" ? selectedSeason : null}
      selectedEpisode={tab === "seasons" ? selectedEpisode : null}
    />
  );
}
