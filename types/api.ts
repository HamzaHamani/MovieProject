import { z } from "zod";

// EXPLORE SECTION API SCHEMA
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

//  SPECIFIED MOVIE SCHEMA FOR EXPLORE PAGE

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

export const specifiedMovie = z.object({
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
  first_air_date: z.string().optional(),
});
export type TspecifiedMovie = z.infer<typeof specifiedMovie>;

// SEARCH PAGE API SCHEMA

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

export const KnownForSchema = z.object({
  backdrop_path: z.union([z.null(), z.string()]),
  id: z.number(),
  title: z.string().optional(),
  original_title: z.string().optional(),
  overview: z.string(),
  poster_path: z.string(),
  media_type: KnownForMediaTypeSchema,
  adult: z.boolean(),
  original_language: OriginalLanguageSchema,
  genre_ids: z.array(z.number()),
  popularity: z.number(),
  release_date: z.string().optional(),
  video: z.boolean().optional(),
  vote_average: z.number(),
  vote_count: z.number(),
  name: z.string().optional(),
  original_name: z.string().optional(),
  first_air_date: z.string().optional(),
  origin_country: z.array(z.string()).optional(),
});
export type KnownFor = z.infer<typeof KnownForSchema>;

export const ResultSchema = z.object({
  backdrop_path: z.union([z.null(), z.string()]),
  id: z.number(),
  name: z.string().optional(),
  original_name: z.string().optional(),
  overview: z.string(),
  poster_path: z.union([z.null(), z.string()]),
  media_type: ResultMediaTypeSchema,
  adult: z.boolean(),
  original_language: OriginalLanguageSchema,
  genre_ids: z.array(z.number()),
  popularity: z.number(),
  first_air_date: z.string().optional(),
  vote_average: z.number(),
  vote_count: z.number(),
  origin_country: z.array(z.string()).optional(),
  title: z.string().optional(),
  original_title: z.string().optional(),
  release_date: z.string().optional(),
  video: z.boolean().optional(),
});
export type Result = z.infer<typeof ResultSchema>;

export const searchMultiSchema = z.object({
  page: z.number(),
  results: z.array(ResultSchema),
  total_pages: z.number(),
  total_results: z.number(),
});

export type TsearchMovie = z.infer<typeof searchMultiSchema>;
