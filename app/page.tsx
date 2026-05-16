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
  return generatePageMetadata({
    title: SITE_NAME,
    description:
      "Discover trending movies and TV shows, log what you watch, and share reviews with cinephiles.",
    canonical: SITE_URL,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
  });
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
