import { notFound } from "next/navigation";
import { Metadata } from "next";

import ExploreTypePageClient from "@/components/explore/exploreTypePageClient";
import { SITE_URL, SITE_NAME } from "@/config/site";
import { generatePageMetadata } from "@/lib/seo-utils";

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

const typeMetadata: Record<
  ExploreType,
  { title: string; description: string }
> = {
  featured: {
    title: "Featured",
    description:
      "Browse our hand-picked selection of featured movies and TV shows on Cinesphere.",
  },
  "just-release": {
    title: "Just Released",
    description:
      "Discover the latest movies and TV shows that just hit theaters and streaming platforms.",
  },
  "top-rated": {
    title: "Top Rated Movies",
    description:
      "Explore the highest-rated movies on Cinesphere. Find critically acclaimed films loved by cinephiles.",
  },
  "popular-tv": {
    title: "Popular TV Shows",
    description:
      "Discover the most popular TV shows trending on Cinesphere. Find your next binge-watch.",
  },
  "on-air-today": {
    title: "On Air Today",
    description:
      "See which TV shows are airing today. Stay updated with current TV schedules on Cinesphere.",
  },
  "on-the-air": {
    title: "Currently Airing",
    description:
      "Browse TV shows that are currently airing. Discover new series and follow ongoing favorites.",
  },
  genre: {
    title: "Browse by Genre",
    description:
      "Explore movies and TV shows by genre. Find exactly what you're in the mood for on Cinesphere.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;

  if (!validTypes.has(type)) {
    return { title: "Explore" };
  }

  const meta = typeMetadata[type as ExploreType];
  return generatePageMetadata({
    title: meta.title,
    description: meta.description,
    canonical: `${SITE_URL}/explore/${type}`,
    ogImage: `${SITE_URL}/og-image.jpg`,
    ogType: "website",
  });
}

export default async function ExploreTypePage({ params }: Props) {
  const { type } = await params;

  if (!validTypes.has(type)) {
    notFound();
  }

  return <ExploreTypePageClient type={type as ExploreType} />;
}
