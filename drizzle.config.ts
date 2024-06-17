import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
console.log("DATABASE_URL", process.env.DATABASE_URL);
config({ path: ".env.local" });
export default defineConfig({
  dialect: "postgresql", // "mysql" | "sqlite" | "postgresql"
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});

// TODO CHECK ENV URL DOESNT WORK, BUT WHEN USING URL DIRECTLY IT WORKS, SO PROB WITH ENVLOCAL
