import { Metadata } from "next";

import ExplorePageClient from "@/components/explore/explorePageClient";

export const metadata: Metadata = {
  title: "Explore",
};

export default function ExplorePage() {
  return <ExplorePageClient />;
}
