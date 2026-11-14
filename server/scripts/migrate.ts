import { readFile } from "node:fs/promises";
import { pool } from "../src/config/db.js";

const sql = await readFile(new URL("../sql/001_lms_schema.sql", import.meta.url), "utf8");
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query(sql);
  await client.query("COMMIT");
  console.info("LMS PostgreSQL schema applied successfully.");
} catch (error) {
  await client.query("ROLLBACK");
  console.error("Schema migration failed:", error);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
