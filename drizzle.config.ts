import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: process.env?.NODE_ENV === "production" ? ".env.prod" : ".env.dev" });

if (!process.env.DATABASE_URL) throw new Error("Add DATABASE_URL");

export default {
  schema: "./src/modules/data-layer/drizzle/schema.ts",
  out: "./src/modules/data-layer/drizzle",
  driver: "pg",
  strict: true,
  verbose: true,
  dbCredentials: {
    connectionString: process.env.DATABASE_URL
  },
  introspect: {
    casing: "preserve"
  }
} satisfies Config;
