import * as schema from "./schema";
// import { config } from "dotenv";
// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";

// const connectionString = process.env.DATABASE_URL!;
// const client = postgres(connectionString);
// export const db = drizzle(client, { schema: schema, logger: true });
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

// config({ path: ".env.local" });
const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema: schem });
