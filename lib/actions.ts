"use server";

import { auth, signIn } from "@/auth";
import { bookmarks, bookmarksMovies, loggedMovies } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { signOut } from "@/auth";
import {
  bookmarksMoviesSchema,
  bookmarksSchema,
  usersSchema,
} from "@/types/index";
import { z } from "zod";
import { TsearchMovie, TspecifiedMovie } from "@/types/api";
import axios from "axios";
import { TspecifiedTv } from "@/types/apiTv";
import { TvideoApiSchema } from "@/types/video";
import { TCreditsSchema } from "@/types/cast";
import { cache } from "react";
import { log } from "console";

//------------------------------------------------------------------------#uilities for handlingath
cache;

// USED CACHE TO PERFORM APP, CHECK WEB CODY DEV VIDEO https://youtu.be/8vJ3JC9O2Eo

export const getUser = cache(async () => {
  const session = await auth();
  const user = session?.user;

  return user;
});
export async function getSession() {
  const session = await auth();
  return session;
}

// auth utilites
export async function handleLogout() {
  await signOut();
}

type provider = "github" | "google" | "twitter" | "facebook" | "reddit";
export async function handleSignin(provider: provider) {
  await signIn(provider);
}
//------------------------------------------------------------------------#uilities for fetching data from the database

//   fetching only the bookmarks of the user

type bookSchemaType = z.infer<typeof bookmarksSchema>;
export async function getBookmarks(userId: string): Promise<bookSchemaType[]> {
  const boks = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));
  // const validatedBoks = boks.map((bookmark) => bookmarksSchema.parse(bookmark));
  //TODO CHECK WHY VALIDATING IS NOT WORKING

  return boks as bookSchemaType[];
}

//   fetch only movies of specied bookmark of that specified user

type moviesBookSchemaType = z.infer<typeof bookmarksMoviesSchema>;

export async function getMoviesBook(
  bookmarkId: string,
): Promise<moviesBookSchemaType[]> {
  // Fetch the movies with the given bookmarkId from the database
  const bookmarkMovies = await db
    .select()
    .from(bookmarksMovies)
    .where(eq(bookmarksMovies.bookmarkId, bookmarkId));

  return bookmarkMovies;
}

//   fetch only SPECIFIED MOVIEID FROM BOOKMARKSMOVIES
export async function getMovieLists(
  movieId: string,
): Promise<moviesBookSchemaType[]> {
  // Fetch the movies with the given bookmarkId from the database
  const bookmarkMovies = await db
    .select()
    .from(bookmarksMovies)
    .where(eq(bookmarksMovies.movieId, movieId));

  return bookmarkMovies;
}

//---------------------- handling adding movie

export async function AddMovie(data: {
  bookmarkId: string;
  review?: string;
  movieId: string | number;
}) {
  if (!data.review) data.review = "";

  // handling movie if already on watchList or not
  const existingMovie = await getMoviesBook(data.bookmarkId);
  const existingMovieResponse = existingMovie.some(
    (movie) => movie.movieId == data.movieId,
  );

  if (existingMovieResponse) return { already: true };
  if (!existingMovieResponse) {
    await db.insert(bookmarksMovies).values({
      bookmarkId: data.bookmarkId as string,
      review: data.review,
      movieId: data.movieId as string,
    });
    return { already: false };
  }
}
//---------------------------

export async function CreateBookmark(data: {
  bookmarkName: string;
  userId: string;
  description: string;
}) {
  const insert = await db
    .insert(bookmarks)
    .values({
      bookmarkName: data.bookmarkName,
      userId: data.userId,
      description: data.description,
    })
    .returning({ id: bookmarks.id });
  // console.log(insert);
  return insert[0];
}

//------------------------------------------------------------------------#uilities for fetching data from the api##

//---- utilites for specified movie
export async function getSpecifiedMovie(id: string): Promise<TspecifiedMovie> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

  return data;
}

// utilite for specified tv show
export async function getSpecifiedTV(id: string): Promise<TspecifiedTv> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

  return data;
}

//---general utilites for fetching data from the api

export async function getSpecifiedTVMovieVideos(
  id: string,
  typeM: "movie" | "tv",
): Promise<TvideoApiSchema> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/${typeM}/${id}/videos?language=en-US&api_key=${process.env.TMDB_API_KEY}`,
  );
  const data: TvideoApiSchema = await res.data;
  return data;
}

export async function getCreditsTVMovie(
  id: string,
  typeM: "movie" | "tv",
): Promise<TCreditsSchema> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/${typeM}/${id}/credits?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;
  return data;
}

// utilite for search page

type values = {
  query: string;
  page: number;
};
export async function getSearchMovie(values: values): Promise<TsearchMovie> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/search/multi?query=${values.query}&include_adult=true&language=en-US&page=${values.page}&api_key=${process.env.TMDB_API_KEY}&include_adult=true`,
  );
  const data: TsearchMovie = await res.data;
  return data;
}

export type TSimilarItem = {
  id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
};

export type TReviewItem = {
  id: string;
  author: string;
  content: string;
  created_at: string;
  author_details?: {
    avatar_path?: string | null;
    rating?: number | null;
  };
};

export type TImageItem = {
  file_path: string;
  width: number;
  height: number;
  vote_average: number;
};

export type TWatchProviderItem = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
};

export type TWatchProvidersData = {
  link: string | null;
  flatrate: TWatchProviderItem[];
  rent: TWatchProviderItem[];
  buy: TWatchProviderItem[];
};

export type TTvEpisodeItem = {
  id: number;
  name: string;
  episode_number: number;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
};

export type TTvSeasonDetails = {
  id: number;
  name: string;
  season_number: number;
  episodes: TTvEpisodeItem[];
};

export type TTvEpisodePerson = {
  id: number;
  name: string;
  profile_path: string | null;
  character?: string;
  job?: string;
  department?: string;
};

export type TTvEpisodeDetails = {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  crew: TTvEpisodePerson[];
  guest_stars: TTvEpisodePerson[];
};

export type TPersonDetails = {
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  known_for_department: string;
  name: string;
  place_of_birth: string | null;
  popularity: number;
  profile_path: string | null;
};

export type TPersonCreditItem = {
  id: number;
  media_type: "movie" | "tv";
  genre_ids: number[];
  poster_path: string | null;
  backdrop_path: string | null;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  character?: string;
  job?: string;
  vote_average: number;
  popularity: number;
};

export type TPersonCombinedCredits = {
  cast: TPersonCreditItem[];
  crew: TPersonCreditItem[];
};

export type TPersonImageItem = {
  file_path: string;
  width: number;
  height: number;
  vote_average: number;
};

export async function getSimilarByType(
  id: string,
  typeM: "movie" | "tv",
): Promise<TSimilarItem[]> {
  try {
    const res = await axios.get(
      `https://api.themoviedb.org/3/${typeM}/${id}/similar?language=en-US&page=1&api_key=${process.env.TMDB_API_KEY}`,
    );
    const data = await res.data;
    return data?.results ?? [];
  } catch {
    return [];
  }
}

export async function getReviewsByType(
  id: string,
  typeM: "movie" | "tv",
): Promise<TReviewItem[]> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/${typeM}/${id}/reviews?language=en-US&page=1&api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;
  return data?.results ?? [];
}

export async function getWatchProvidersByType(
  id: string,
  typeM: "movie" | "tv",
): Promise<TWatchProvidersData> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/${typeM}/${id}/watch/providers?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

  const countryMap: Record<string, unknown> =
    data?.results && typeof data.results === "object"
      ? (data.results as Record<string, unknown>)
      : {};

  const usProviders = countryMap.US;
  const fallbackProviders = Object.values(countryMap).find(
    (value) => typeof value === "object" && value !== null,
  );

  const selected =
    (usProviders as Record<string, unknown> | undefined) ??
    (fallbackProviders as Record<string, unknown> | undefined) ??
    {};

  const normalizeProviders = (key: "flatrate" | "rent" | "buy") => {
    const raw = selected[key];
    if (!Array.isArray(raw)) return [] as TWatchProviderItem[];

    return raw
      .map((item: unknown) => {
        const provider = item as Record<string, unknown>;
        return {
          provider_id: Number(provider.provider_id ?? 0),
          provider_name: String(provider.provider_name ?? "Unknown Provider"),
          logo_path:
            typeof provider.logo_path === "string" ? provider.logo_path : null,
          display_priority: Number(provider.display_priority ?? 0),
        };
      })
      .filter((provider: TWatchProviderItem) => provider.provider_id > 0)
      .sort(
        (a: TWatchProviderItem, b: TWatchProviderItem) =>
          a.display_priority - b.display_priority,
      );
  };

  return {
    link: typeof selected.link === "string" ? selected.link : null,
    flatrate: normalizeProviders("flatrate"),
    rent: normalizeProviders("rent"),
    buy: normalizeProviders("buy"),
  };
}

export async function getImagesByType(
  id: string,
  typeM: "movie" | "tv",
): Promise<TImageItem[]> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/${typeM}/${id}/images?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;
  const backdrops = Array.isArray(data?.backdrops) ? data.backdrops : [];
  const posters = Array.isArray(data?.posters) ? data.posters : [];

  return [...backdrops, ...posters]
    .filter((item) => item?.file_path)
    .slice(0, 24);
}

export async function getTVSeasonDetails(
  tvId: string,
  seasonNumber: number,
): Promise<TTvSeasonDetails> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?language=en-US&api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

  return {
    id: data.id,
    name: data.name,
    season_number: data.season_number,
    episodes: Array.isArray(data.episodes)
      ? data.episodes.map((episode: any) => ({
          id: episode.id,
          name: episode.name,
          episode_number: episode.episode_number,
          still_path: episode.still_path ?? null,
          air_date: episode.air_date ?? null,
          runtime: episode.runtime ?? null,
        }))
      : [],
  };
}

export async function getTVEpisodeDetails(
  tvId: string,
  seasonNumber: number,
  episodeNumber: number,
): Promise<TTvEpisodeDetails> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}?language=en-US&api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

  return {
    id: data.id,
    name: data.name,
    overview: data.overview ?? "",
    episode_number: data.episode_number ?? 0,
    season_number: data.season_number ?? seasonNumber,
    still_path: data.still_path ?? null,
    air_date: data.air_date ?? null,
    runtime: data.runtime ?? null,
    vote_average: data.vote_average ?? 0,
    vote_count: data.vote_count ?? 0,
    crew: Array.isArray(data.crew)
      ? data.crew.map((person: unknown) => {
          const p = person as Record<string, unknown>;
          return {
            id: Number(p.id ?? 0),
            name: String(p.name ?? "Unknown"),
            profile_path:
              typeof p.profile_path === "string" ? p.profile_path : null,
            job: typeof p.job === "string" ? p.job : undefined,
            department:
              typeof p.department === "string" ? p.department : undefined,
          };
        })
      : [],
    guest_stars: Array.isArray(data.guest_stars)
      ? data.guest_stars.map((person: unknown) => {
          const p = person as Record<string, unknown>;
          return {
            id: Number(p.id ?? 0),
            name: String(p.name ?? "Unknown"),
            profile_path:
              typeof p.profile_path === "string" ? p.profile_path : null,
            character:
              typeof p.character === "string" ? p.character : undefined,
          };
        })
      : [],
  };
}

export async function getPersonDetails(id: string): Promise<TPersonDetails> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/person/${id}?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

  return {
    adult: Boolean(data?.adult),
    also_known_as: Array.isArray(data?.also_known_as) ? data.also_known_as : [],
    biography: data?.biography ?? "",
    birthday: data?.birthday ?? null,
    deathday: data?.deathday ?? null,
    gender: data?.gender ?? 0,
    homepage: data?.homepage ?? null,
    id: data?.id ?? 0,
    imdb_id: data?.imdb_id ?? null,
    known_for_department: data?.known_for_department ?? "Unknown",
    name: data?.name ?? "Unknown",
    place_of_birth: data?.place_of_birth ?? null,
    popularity: data?.popularity ?? 0,
    profile_path: data?.profile_path ?? null,
  };
}

export async function getPersonCombinedCredits(
  id: string,
): Promise<TPersonCombinedCredits> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;

  const normalizeCreditItem = (item: Record<string, unknown>) => {
    const mediaType = item?.media_type === "tv" ? "tv" : "movie";

    return {
      id: Number(item?.id ?? 0),
      media_type: mediaType,
      genre_ids: Array.isArray(item?.genre_ids)
        ? item.genre_ids
            .map((genreId: unknown) => Number(genreId))
            .filter((genreId: number) => Number.isFinite(genreId))
        : [],
      poster_path:
        typeof item?.poster_path === "string" ? item.poster_path : null,
      backdrop_path:
        typeof item?.backdrop_path === "string" ? item.backdrop_path : null,
      title: typeof item?.title === "string" ? item.title : undefined,
      name: typeof item?.name === "string" ? item.name : undefined,
      release_date:
        typeof item?.release_date === "string" ? item.release_date : undefined,
      first_air_date:
        typeof item?.first_air_date === "string"
          ? item.first_air_date
          : undefined,
      character:
        typeof item?.character === "string" ? item.character : undefined,
      job: typeof item?.job === "string" ? item.job : undefined,
      vote_average: Number(item?.vote_average ?? 0),
      popularity: Number(item?.popularity ?? 0),
    } as TPersonCreditItem;
  };

  const cast = Array.isArray(data?.cast)
    ? data.cast
        .map((item: unknown) =>
          normalizeCreditItem(item as Record<string, unknown>),
        )
        .filter((item: TPersonCreditItem) => item.id > 0)
    : [];

  const crew = Array.isArray(data?.crew)
    ? data.crew
        .map((item: unknown) =>
          normalizeCreditItem(item as Record<string, unknown>),
        )
        .filter((item: TPersonCreditItem) => item.id > 0)
    : [];

  return { cast, crew };
}

export async function getPersonImages(id: string): Promise<TPersonImageItem[]> {
  const res = await axios.get(
    `https://api.themoviedb.org/3/person/${id}/images?api_key=${process.env.TMDB_API_KEY}`,
  );
  const data = await res.data;
  const profiles: Array<Record<string, unknown>> = Array.isArray(data?.profiles)
    ? data.profiles
    : [];

  return profiles
    .filter((item: Record<string, unknown>) => item?.file_path)
    .map((item: Record<string, unknown>) => ({
      file_path: String(item.file_path),
      width: Number(item.width ?? 0),
      height: Number(item.height ?? 0),
      vote_average: Number(item.vote_average ?? 0),
    }))
    .slice(0, 12);
}

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

type ExploreListResponse<T> = {
  results: T[];
};

async function getExploreList<T>(endpoint: string): Promise<T[]> {
  const hasQuery = endpoint.includes("?");
  const connector = hasQuery ? "&" : "?";
  const res = await axios.get(
    `https://api.themoviedb.org/3/${endpoint}${connector}language=en-US&page=1&api_key=${process.env.TMDB_API_KEY}`,
  );

  const data: ExploreListResponse<T> = await res.data;
  return data.results ?? [];
}

export async function getExploreTrendingList(): Promise<ExploreTrendingItem[]> {
  return getExploreList<ExploreTrendingItem>("trending/all/week");
}

export async function getExploreNowPlayingMovies(): Promise<
  ExploreMovieListItem[]
> {
  return getExploreList<ExploreMovieListItem>("movie/now_playing");
}

export async function getExploreTopRatedMovies(): Promise<
  ExploreMovieListItem[]
> {
  return getExploreList<ExploreMovieListItem>("movie/top_rated");
}

export async function getExplorePopularTvShows(): Promise<ExploreTvListItem[]> {
  return getExploreList<ExploreTvListItem>("tv/popular");
}

export async function getExploreOnTheAirTvShows(): Promise<
  ExploreTvListItem[]
> {
  return getExploreList<ExploreTvListItem>("tv/on_the_air");
}

export async function getExploreGenreMovies(
  withGenres: string,
): Promise<ExploreMovieListItem[]> {
  return getExploreList<ExploreMovieListItem>(
    `discover/movie?include_adult=false&include_video=false&sort_by=vote_average.desc&vote_count.gte=1200&with_genres=${withGenres}`,
  );
}

export async function getExploreMediaDetails(
  mediaType: "movie" | "tv",
  id: number,
): Promise<ExploreMediaDetails | null> {
  try {
    const res = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${id}?language=en-US&api_key=${process.env.TMDB_API_KEY}`,
    );
    const data: ExploreMediaDetails = await res.data;
    return data;
  } catch {
    return null;
  }
}

export async function getExploreMovieDetails(
  id: number,
): Promise<ExploreMediaDetails | null> {
  return getExploreMediaDetails("movie", id);
}
type Props = {
  reviewTitle: string;
  rating: number;
  date: string;
  review: string;
  showId: string | number; // Assuming showId can be a string or number
};

export async function sendLoggedMovieTv({
  reviewTitle,
  rating,
  date,
  review,
  showId,
}: Props) {
  const user = await getUser();

  if (!user) throw new Error("User not authenticated");

  const logData = {
    reviewTitle,
    rating,
    date,
    review,
    userId: user.id,
    showId,
  };

  console.log(logData);

  // await db.insert(loggedMovies).values(logData).onConflictDoNothing();
  await db
    .insert(loggedMovies)
    .values({
      reviewTitle,
      rating,
      watchedAt: new Date(date),
      review,
      userId: user.id as string,
      showId: showId as string,
    })
    .onConflictDoNothing();

  // Here you would typically send this data to your backend or database
  console.log("Log Data:", logData);
  return logData; // Return the log data for further processing if needed
}
