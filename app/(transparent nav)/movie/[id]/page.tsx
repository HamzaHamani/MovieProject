import WholeDisplay from "@/components/movie/wholeDisplay";
import { getSimilarByType, getSpecifiedMovie } from "@/lib/actions";
import { TspecifiedMovie } from "@/types/api";
import { Metadata } from "next";
import { notFound } from "next/navigation";

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
  const res = await fetchMovie();
  return {
    title: res.title,
    description: res.overview,
  };
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
