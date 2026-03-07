import { z } from "zod";

// Define the schemas and types
const CastMemberSchema = z.object({
  adult: z.boolean(),
  gender: z.number(),
  id: z.number(),
  known_for_department: z.string(),
  name: z.string(),
  original_name: z.string(),
  popularity: z.number(),
  profile_path: z.string(),
  character: z.string(),
  credit_id: z.string(),
  order: z.number(),
});

export type CastMember = z.infer<typeof CastMemberSchema>;

const CrewMemberSchema = z.object({
  credit_id: z.string(),
  department: z.string(),
  gender: z.number().nullable(),
  id: z.number(),
  job: z.string(),
  name: z.string(),
  profile_path: z.string().nullable(),
});

export type CrewMember = z.infer<typeof CrewMemberSchema>;

const CreditsSchema = z.object({
  id: z.number(),
  cast: z.array(CastMemberSchema),
  crew: z.array(CrewMemberSchema),
});

export type TCreditsSchema = z.infer<typeof CreditsSchema>;
