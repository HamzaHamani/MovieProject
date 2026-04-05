import { notFound } from "next/navigation";

import ExploreTypePageClient from "@/components/explore/exploreTypePageClient";

type Props = {
  params: Promise<{
    type: string;
  }>;
};

const validTypes = new Set([
  "featured",
  "just-release",
  "top-rated",
  "popular-tv",
  "on-air-today",
  "on-the-air",
  "genre",
]);

type ExploreType =
  | "featured"
  | "just-release"
  | "top-rated"
  | "popular-tv"
  | "on-air-today"
  | "on-the-air"
  | "genre";

export default async function ExploreTypePage({ params }: Props) {
  const { type } = await params;

  if (!validTypes.has(type)) {
    notFound();
  }

  return <ExploreTypePageClient type={type as ExploreType} />;
}
