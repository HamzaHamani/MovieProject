import WholeDisplay from "@/components/movie/wholeDisplay";
import { getSimilarByType, getSpecifiedMovie } from "@/lib/actions";
import { TspecifiedMovie } from "@/types/api";
import { Metadata } from "next";

type Props = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  async function fetchMovie(): Promise<TspecifiedMovie> {
    try {
      const data = await getSpecifiedMovie(id);
      return data as TspecifiedMovie;
    } catch (e) {
      throw new Error("Failed to fetch the movie");
    }
  }
  const res = await fetchMovie();
  return {
    title: res.title,
    description: res.overview,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = params;
  async function fetchMovie(): Promise<TspecifiedMovie> {
    try {
      const data = await getSpecifiedMovie(id);
      return data as TspecifiedMovie;
    } catch (e) {
      throw new Error("Failed to fetch movie");
    }
  }

  const [response, similar] = await Promise.all([
    fetchMovie(),
    getSimilarByType(id, "movie"),
  ]);

  const rawTab = searchParams?.tab;
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
    normalizedTab === "reviews" ||
    normalizedTab === "providers"
      ? normalizedTab
      : "videos";

  return (
    <WholeDisplay
      response={response}
      similar={similar}
      activeTab={tab}
      typeM={"movie"}
    />
  );
}
