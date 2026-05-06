import LandingBackdropCarouselClient from "./landingBackdropCarouselClient";
import { tmdbFetch } from "@/lib/tmdb-api";

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
    backdrop_path: null,
    title: "Fight Club",
    media_type: "movie",
  },
  {
    id: 278,
    backdrop_path: null,
    title: "The Shawshank Redemption",
    media_type: "movie",
  },
  {
    id: 238,
    backdrop_path: null,
    title: "The Godfather",
    media_type: "movie",
  },
  {
    id: 240,
    backdrop_path: null,
    title: "The Godfather Part II",
    media_type: "movie",
  },
];

async function fetchBackdropMovies(): Promise<TrendingMovie[]> {
  try {
    const response = await tmdbFetch<{ results: TrendingMovie[] }>(
      "/trending/all/week",
      { language: "en-US", page: 1 },
      "Landing backdrop carousel",
    );

    const movies = response.results ?? [];
    const moviesWithBackdrops = movies.filter(
      (m) =>
        m.backdrop_path && (m.media_type === "movie" || m.media_type === "tv"),
    );

    return moviesWithBackdrops.length > 0
      ? moviesWithBackdrops.slice(0, 8)
      : FALLBACK_MOVIES;
  } catch (error) {
    console.warn("Failed to fetch backdrop movies, using fallback:", error);
    return FALLBACK_MOVIES;
  }
}

export default async function LandingBackdropCarousel() {
  const movies = await fetchBackdropMovies();
  return <LandingBackdropCarouselClient movies={movies} />;
}
