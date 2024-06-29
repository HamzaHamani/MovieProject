import WholeDisplay from "@/components/tv/WholeDisplay";
import { getSpecifiedMovie, getSpecifiedTV } from "@/lib/actions";
import { TspecifiedMovie } from "@/types/api";
import { TspecifiedTv } from "@/types/apiTv";
import axios from "axios";
import { Metadata } from "next";

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
export default async function page({ params }: Props) {
  const { id } = params;
  async function fetch(): Promise<TspecifiedTv> {
    try {
      const data: TspecifiedTv = await getSpecifiedTV(id);
      return data;
    } catch (e) {
      console.error(e);
      throw new Error("Failed to fetch movie");
    }
  }
  const response = await fetch();
  console.log(response.adult);

  return <WholeDisplay response={response} />;
}
