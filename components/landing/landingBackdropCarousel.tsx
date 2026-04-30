import LandingBackdropCarouselClient from "./landingBackdropCarouselClient";

interface TrendingMovie {
  id: number;
  backdrop_path: string | null;
  title?: string;
  name?: string;
  media_type: "movie" | "tv";
}

const FALLBACK_MOVIES: TrendingMovie[] = [
  {
    id: 550,
    backdrop_path: "/path1.jpg",
    title: "Fight Club",
    media_type: "movie",
  },
  {
    id: 278,
    backdrop_path: "/path2.jpg",
    title: "The Shawshank Redemption",
    media_type: "movie",
  },
  {
    id: 238,
    backdrop_path: "/path3.jpg",
    title: "The Godfather",
    media_type: "movie",
  },
  {
    id: 240,
    backdrop_path: "/path4.jpg",
    title: "The Godfather Part II",
    media_type: "movie",
  },
];

async function fetchBackdropMovies(): Promise<TrendingMovie[]> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/explore?kind=featured`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return FALLBACK_MOVIES;
    }

    const movies: TrendingMovie[] = await response.json();
    const moviesWithBackdrops = movies.filter(
      (m) => m.backdrop_path && (m.media_type === "movie" || m.media_type === "tv")
    );
    
    return moviesWithBackdrops.length > 0 ? moviesWithBackdrops.slice(0, 8) : FALLBACK_MOVIES;
  } catch (error) {
    console.warn("Failed to fetch backdrop movies, using fallback:", error);
    return FALLBACK_MOVIES;
  }
}

export default async function LandingBackdropCarousel() {
  const movies = await fetchBackdropMovies();
  return <LandingBackdropCarouselClient movies={movies} />;
}
