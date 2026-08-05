import LandingPageClient from "@/components/landing/landingPageClient";
import Navbar from "@/components/navbar/navbar";
import LandingBackdropCarousel from "@/components/landing/landingBackdropCarousel";
import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/config/site";
import { generatePageMetadata } from "@/lib/seo-utils";
export const logo = "/logo.png";
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
      "Watch movies and TV shows, discover what to watch next, and track your watchlist for free on Cinesphere.",
    canonical: SITE_URL,
    ogImage: logo,
    ogType: "website",
    keywords: [
      "watching movies free",
      "watching tv shows free",
      "watch movies free",
      "watch tv shows free",
      "best movies to watch",
      "best tv shows to watch",
      "movie tracker",
      "tv show tracker",
      "what movie should i watch",
      "what show should i watch",
    ],
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
