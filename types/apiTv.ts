import { z } from "zod";

export const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
});
export type Genre = z.infer<typeof GenreSchema>;

export const LastEpisodeToAirSchema = z.object({
  id: z.number(),
  name: z.string(),
  overview: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
  air_date: z.string(),
  episode_number: z.number(),
  episode_type: z.string(),
  production_code: z.string(),
  runtime: z.null(),
  season_number: z.number(),
  show_id: z.number(),
  still_path: z.null(),
});
export type LastEpisodeToAir = z.infer<typeof LastEpisodeToAirSchema>;

export const NetworkSchema = z.object({
  id: z.number(),
  logo_path: z.union([z.null(), z.string()]),
  name: z.string(),
  origin_country: z.string(),
});
export type Network = z.infer<typeof NetworkSchema>;

export const ProductionCountrySchema = z.object({
  iso_3166_1: z.string(),
  name: z.string(),
});
export type ProductionCountry = z.infer<typeof ProductionCountrySchema>;

export const SeasonSchema = z.object({
  air_date: z.string(),
  episode_count: z.number(),
  id: z.number(),
  name: z.string(),
  overview: z.string(),
  poster_path: z.union([z.null(), z.string()]),
  season_number: z.number(),
  vote_average: z.number(),
});
export type Season = z.infer<typeof SeasonSchema>;

export const SpokenLanguageSchema = z.object({
  english_name: z.string(),
  iso_639_1: z.string(),
  name: z.string(),
});
export type SpokenLanguage = z.infer<typeof SpokenLanguageSchema>;

export const specifiedTv = z.object({
  adult: z.boolean(),
  backdrop_path: z.string(),
  created_by: z.array(z.any()),
  episode_run_time: z.array(z.number()),
  first_air_date: z.string(),
  genres: z.array(GenreSchema),
  homepage: z.string(),
  id: z.number(),
  in_production: z.boolean(),
  languages: z.array(z.string()),
  last_air_date: z.string(),
  last_episode_to_air: LastEpisodeToAirSchema,
  name: z.string(),
  next_episode_to_air: z.null(),
  networks: z.array(NetworkSchema),
  number_of_episodes: z.number(),
  number_of_seasons: z.number(),
  origin_country: z.array(z.string()),
  original_language: z.string(),
  original_name: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string(),
  production_companies: z.array(NetworkSchema),
  production_countries: z.array(ProductionCountrySchema),
  seasons: z.array(SeasonSchema),
  spoken_languages: z.array(SpokenLanguageSchema),
  status: z.string(),
  tagline: z.string(),
  type: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
});
export type TspecifiedTv = z.infer<typeof specifiedTv>;
