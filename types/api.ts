import { z } from "zod";

export const exploreApiSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string(),
  genre_ids: z.array(z.number()),
  id: z.number(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string(),
  release_date: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
});
export type TexploreApiSchema = z.infer<typeof exploreApiSchema>;

export const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
});
export type Genre = z.infer<typeof GenreSchema>;

export const ProductionCompanySchema = z.object({
  id: z.number(),
  logo_path: z.null(),
  name: z.string(),
  origin_country: z.string(),
});
export type ProductionCompany = z.infer<typeof ProductionCompanySchema>;

export const ProductionCountrySchema = z.object({
  iso_3166_1: z.string(),
  name: z.string(),
});
export type ProductionCountry = z.infer<typeof ProductionCountrySchema>;

export const SpokenLanguageSchema = z.object({
  english_name: z.string(),
  iso_639_1: z.string(),
  name: z.string(),
});
export type SpokenLanguage = z.infer<typeof SpokenLanguageSchema>;

export const WelcomeSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string(),
  belongs_to_collection: z.null(),
  budget: z.number(),
  genres: z.array(GenreSchema),
  homepage: z.string(),
  id: z.number(),
  imdb_id: z.string(),
  origin_country: z.array(z.string()),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string(),
  production_companies: z.array(ProductionCompanySchema),
  production_countries: z.array(ProductionCountrySchema),
  release_date: z.string(),
  revenue: z.number(),
  runtime: z.number(),
  spoken_languages: z.array(SpokenLanguageSchema),
  status: z.string(),
  tagline: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
});
export type TspecifiedMovie = z.infer<typeof WelcomeSchema>;
