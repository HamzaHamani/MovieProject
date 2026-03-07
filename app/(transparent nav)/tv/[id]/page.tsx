import WholeDisplay from "@/components/tv/WholeDisplay";
import { getReviewsByType, getSimilarByType, getSpecifiedTV } from "@/lib/actions";
import { TspecifiedTv } from "@/types/apiTv";

type Props = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
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
  const { id } = params;
  async function fetch(): Promise<TspecifiedTv> {
    try {
      const data: TspecifiedTv = await getSpecifiedTV(id);
      return data;
    } catch (e) {
      console.error(e);
      throw new Error("Failed to fetch tv show");
    }
  }
  const [response, similar] = await Promise.all([
    fetch(),
    getSimilarByType(id, "tv"),
  ]);

  const rawTab = searchParams?.tab;
  const tabValue = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  const tab =
    tabValue === "seasons" ||
    tabValue === "universe" ||
    tabValue === "news" ||
    tabValue === "reviews"
      ? tabValue
      : "seasons";

  const reviews = tab === "reviews" ? await getReviewsByType(id, "tv") : [];

  return (
    <WholeDisplay
      response={response}
      similar={similar}
      reviews={reviews}
      activeTab={tab}
    />
  );
}
