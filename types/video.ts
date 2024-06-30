import * as z from "zod";

export const Iso3166_1Schema = z.enum(["US"]);
export type Iso3166_1 = z.infer<typeof Iso3166_1Schema>;

export const Iso639_1Schema = z.enum(["en"]);
export type Iso639_1 = z.infer<typeof Iso639_1Schema>;

export const SiteSchema = z.enum(["YouTube"]);
export type Site = z.infer<typeof SiteSchema>;

export const ResultSchema = z.object({
  iso_639_1: Iso639_1Schema,
  iso_3166_1: Iso3166_1Schema,
  name: z.string(),
  key: z.string(),
  site: SiteSchema,
  size: z.number(),
  type: z.string(),
  official: z.boolean(),
  published_at: z.coerce.date(),
  id: z.string(),
});
export type Result = z.infer<typeof ResultSchema>;

export const videoApiSchema = z.object({
  id: z.number(),
  results: z.array(ResultSchema),
});
export type TvideoApiSchema = z.infer<typeof videoApiSchema>;
