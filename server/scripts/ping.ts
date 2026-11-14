import { pool } from "../src/config/db.js";

try {
  const result = await pool.query<{ database: string }>("SELECT current_database() AS database");
  console.info(`PostgreSQL connection successful: ${result.rows[0]?.database}`);
} catch (error) {
  console.error("PostgreSQL connection failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
