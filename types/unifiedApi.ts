import { z } from "zod";

// Define common schemas and types
export const KnownForMediaTypeSchema = z.enum(["movie", "tv", "person"]);
export type KnownForMediaType = z.infer<typeof KnownForMediaTypeSchema>;

export const OriginalLanguageSchema = z.enum(["en", "id", "nl"]);
export type OriginalLanguage = z.infer<typeof OriginalLanguageSchema>;

export const KnownForDepartmentSchema = z.enum([
  "Acting",
  "Directing",
  "Editing",
  "Writing",
]);
export type KnownForDepartment = z.infer<typeof KnownForDepartmentSchema>;

export const ResultMediaTypeSchema = z.enum(["movie", "tv", "person"]);
export type ResultMediaType = z.infer<typeof ResultMediaTypeSchema>;

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

// Define the unified schema combining common, TV-specific, and Movie-specific properties
export const unifiedSchema = z.object({
  // Common properties
  adult: z.boolean(),
  backdrop_path: z.union([z.null(), z.string()]),
  id: z.number(),
  overview: z.string(),
  poster_path: z.union([z.null(), z.string()]),
  media_type: ResultMediaTypeSchema,
  original_language: OriginalLanguageSchema,
  popularity: z.number(),
  vote_average: z.number(),
  vote_count: z.number(),

  // TV-specific properties
  TV_created_by: z.array(z.any()),
  TV_episode_run_time: z.array(z.number()),
  TV_first_air_date: z.string(),
  TV_genres: z.array(GenreSchema),
  TV_homepage: z.string(),
  TV_in_production: z.boolean(),
  TV_languages: z.array(z.string()),
  TV_last_air_date: z.string(),
  TV_last_episode_to_air: LastEpisodeToAirSchema,
  name: z.string(), // Common name
  TV_next_episode_to_air: z.null(),
  TV_networks: z.array(NetworkSchema),
  TV_number_of_episodes: z.number(),
  TV_number_of_seasons: z.number(),
  TV_origin_country: z.array(z.string()),
  original_name: z.string(), // Common original_name
  TV_production_companies: z.array(NetworkSchema),
  TV_production_countries: z.array(ProductionCountrySchema),
  TV_seasons: z.array(SeasonSchema),
  TV_spoken_languages: z.array(SpokenLanguageSchema),
  TV_status: z.string(),
  TV_tagline: z.string(),
  TV_type: z.string(),

  // Movie-specific properties
  M_genre_ids: z.array(z.number()),
  M_first_air_date: z.string().optional(),
  M_title: z.string().optional(),
  M_original_title: z.string().optional(),
  M_release_date: z.string().optional(),
  M_video: z.boolean().optional(),
});

// Export the unified schema
export type TUnifiedSchema = z.infer<typeof unifiedSchema>;
