import { Pool } from "pg";
import { env } from "./env.js";

/** Shared pool for LMS queries and Better Auth. TLS configuration comes from DATABASE_URL. */
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (error) => {
  console.error("PostgreSQL idle connection error:", error.message);
});

export async function connectDatabase(): Promise<void> {
  await pool.query("SELECT 1");
  console.info("PostgreSQL connected");
}
