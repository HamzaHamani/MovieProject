import WholeDisplay from "@/components/movie/wholeDisplay";
import { getSpecifiedMovie } from "@/lib/actions";
import { TspecifiedMovie } from "@/types/api";
import axios from "axios";
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

export default async function Page({ params }: Props) {
  const { id } = params;
  async function fetchMovie(): Promise<TspecifiedMovie> {
    try {
      const data = await getSpecifiedMovie(id);
      return data as TspecifiedMovie;
    } catch (e) {
      throw new Error("Failed to fetch movie");
    }
  }
  const response = await fetchMovie();

  return <WholeDisplay response={response} />;
}
