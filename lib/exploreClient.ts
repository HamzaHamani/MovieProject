import {
  ExploreMediaDetails,
  ExploreMovieListItem,
  ExplorePagedResponse,
  ExploreTrendingItem,
  ExploreTvListItem,
} from "@/types/explore";

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Explore request failed");
  }

  return response.json() as Promise<T>;
}

export function fetchExploreTrendingList() {
  return getJson<ExploreTrendingItem[]>("/api/explore?kind=featured");
}

export function fetchExploreNowPlayingMovies() {
  return getJson<ExploreMovieListItem[]>("/api/explore?kind=just-release");
}

export function fetchExploreTopRatedMovies() {
  return getJson<ExploreMovieListItem[]>("/api/explore?kind=top-rated");
}

export function fetchExplorePopularTvShows() {
  return getJson<ExploreTvListItem[]>("/api/explore?kind=popular-tv");
}

export function fetchExploreOnTheAirTvShows() {
  return getJson<ExploreTvListItem[]>("/api/explore?kind=on-the-air");
}

export function fetchExploreGenreMovies(withGenres: string) {
  return getJson<ExploreMovieListItem[]>(
    `/api/explore?kind=genre&withGenres=${encodeURIComponent(withGenres)}`,
  );
}

export function fetchExploreMediaDetails(
  mediaType: "movie" | "tv",
  id: number,
) {
  return getJson<ExploreMediaDetails>(
    `/api/explore/details?mediaType=${mediaType}&id=${id}`,
  );
}

export function fetchExploreMovieDetails(id: number) {
  return fetchExploreMediaDetails("movie", id);
}

type PagedKind =
  | "featured"
  | "just-release"
  | "top-rated"
  | "popular-tv"
  | "on-the-air"
  | "genre";

type ExplorePagedItem =
  | ExploreTrendingItem
  | ExploreMovieListItem
  | ExploreTvListItem;

export function fetchExplorePaged(
  kind: PagedKind,
  page: number,
  withGenres?: string,
) {
  const params = new URLSearchParams({ kind, page: String(page) });
  if (withGenres) {
    params.set("withGenres", withGenres);
  }

  return getJson<ExplorePagedResponse<ExplorePagedItem>>(
    `/api/explore?${params.toString()}`,
  );
}
