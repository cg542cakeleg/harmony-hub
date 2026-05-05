import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Prefer the Neon integration URL (harmonyhub_ prefix) which has the correct
// schema, falling back to the generic DATABASE_URL for local / other envs.
const databaseUrl =
  process.env.harmonyhub_DATABASE_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

export * from "./schema";
