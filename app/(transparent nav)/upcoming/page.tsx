import UpcomingPageClient from "@/components/upcoming/upcomingPageClient";

type UpcomingMovie = {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

type UpcomingResponse = {
  dates: {
    maximum: string;
    minimum: string;
  };
  page: number;
  total_pages: number;
  total_results: number;
  results: UpcomingMovie[];
};

async function fetchUpcoming(page: number) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is missing");
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=${page}&api_key=${apiKey}`,
    {
      next: { revalidate: 1800 },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch upcoming movies from TMDB");
  }

  return (await response.json()) as UpcomingResponse;
}

export default async function UpcomingPage() {
  const firstPage = await fetchUpcoming(1);

  const initialPages = [firstPage];
  if ((firstPage.total_pages || 1) > 1) {
    const secondPage = await fetchUpcoming(2);
    initialPages.push(secondPage);
  }

  return <UpcomingPageClient initialPages={initialPages} />;
}
