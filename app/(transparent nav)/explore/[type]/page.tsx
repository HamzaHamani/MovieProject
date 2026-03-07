import { notFound } from "next/navigation";

import ExploreTypePageClient from "@/components/explore/exploreTypePageClient";

type Props = {
  params: {
    type: string;
  };
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

export default function ExploreTypePage({ params }: Props) {
  if (!validTypes.has(params.type)) {
    notFound();
  }

  return <ExploreTypePageClient type={params.type as ExploreType} />;
}
