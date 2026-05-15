import LandingPageClient from "@/components/landing/landingPageClient";
import Navbar from "@/components/navbar/navbar";
import LandingBackdropCarousel from "@/components/landing/landingBackdropCarousel";
import { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/config/site";
import { generatePageMetadata } from "@/lib/seo-utils";

export const dynamic = "force-dynamic";

type TMDBResult = {
  title?: string;
  overview?: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      return generatePageMetadata({
        title: "Home",
        description:
          "Discover trending movies and TV shows, log what you watch, and share reviews with cinephiles.",
        canonical: SITE_URL,
        ogImage: DEFAULT_OG_IMAGE,
      });
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&api_key=${apiKey}`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch popular movies for metadata");
    }

    const data = (await response.json()) as { results?: TMDBResult[] };
    const featured = data.results?.[0];

    const imagePath = featured?.backdrop_path || featured?.poster_path;
    const ogImage = imagePath
      ? `https://image.tmdb.org/t/p/w1280${imagePath}`
      : DEFAULT_OG_IMAGE;

    const title = featured?.title ? `${featured.title} and More` : "Home";
    const description = featured?.overview?.trim()
      ? `${featured.overview.slice(0, 150)}${featured.overview.length > 150 ? "..." : ""}`
      : `Discover trending movies and TV shows on ${SITE_NAME}. Log what you watch and share reviews.`;

    return generatePageMetadata({
      title,
      description,
      canonical: SITE_URL,
      ogImage,
      ogType: "website",
    });
  } catch {
    return generatePageMetadata({
      title: "Home",
      description:
        "Discover trending movies and TV shows, log what you watch, and share reviews with cinephiles.",
      canonical: SITE_URL,
      ogImage: DEFAULT_OG_IMAGE,
    });
  }
}

export default function LandingPage() {
  return (
    <div className="relative h-dvh overflow-hidden bg-backgroundM">
      <Navbar type="transparent" />
      <div className="relative h-dvh overflow-hidden pt-16 md:pt-14">
        <div className="absolute inset-0">
          <LandingBackdropCarousel />
        </div>
        <div className="relative z-20">
          <LandingPageClient />
        </div>
      </div>
    </div>
  );
}
