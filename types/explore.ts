export type ExploreMovieListItem = {
  id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  title: string;
  release_date: string;
  vote_average: number;
};

export type ExploreTvListItem = {
  id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  name: string;
  first_air_date: string;
  vote_average: number;
};

export type ExploreTrendingItem = {
  id: number;
  media_type: "movie" | "tv" | "person";
  poster_path: string | null;
  backdrop_path: string | null;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
};

export type ExploreMediaDetails = {
  genres: { id: number; name: string }[];
  runtime?: number | null;
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
};

export type ExplorePagedResponse<T> = {
  results: T[];
  page: number;
  hasMore: boolean;
};
