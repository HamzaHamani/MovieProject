import { Metadata } from "next";

import ExplorePageClient from "@/components/explore/explorePageClient";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/config/site";
import { generatePageMetadata } from "@/lib/seo-utils";
import { getCurrentUserDbProfile, getUser } from "@/lib/actions";

type TMDBResult = {
  name?: string;
  overview?: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      return generatePageMetadata({
        title: "Explore",
        description:
          "Explore new world to movies and tv shows. Discover popular and top-rated content on Cinesphere.",
        canonical: `${SITE_URL}/explore`,
        ogImage: DEFAULT_OG_IMAGE,
      });
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/tv/popular?language=en-US&page=1&api_key=${apiKey}`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch popular TV metadata");
    }

    const data = (await response.json()) as { results?: TMDBResult[] };
    const featured = data.results?.[0];

    const imagePath = featured?.backdrop_path || featured?.poster_path;
    const ogImage = imagePath
      ? `https://image.tmdb.org/t/p/w1280${imagePath}`
      : DEFAULT_OG_IMAGE;

    const description =
      "Explore new world to movies and tv shows. Discover popular and top-rated content on Cinesphere.";

    return generatePageMetadata({
      title: "Explore",
      description,
      canonical: `${SITE_URL}/explore`,
      ogImage,
      ogType: "website",
    });
  } catch {
    return generatePageMetadata({
      title: "Explore",
      description:
        "Explore new world to movies and tv shows. Discover popular and top-rated content on Cinesphere.",
      canonical: `${SITE_URL}/explore`,
      ogImage: DEFAULT_OG_IMAGE,
    });
  }
}

export default async function ExplorePage() {
  const user = await getUser();
  const profile = user?.id ? await getCurrentUserDbProfile() : null;
  const needsUsernameSetup = Boolean(user?.id && !profile?.username);

  return (
    <ExplorePageClient
      userId={user?.id ?? null}
      showUsernameSetup={needsUsernameSetup}
      suggestedName={user?.name ?? null}
    />
  );
}
