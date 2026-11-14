import { pool } from "../config/db.js";
import type { QueryResultRow } from "pg";
import type { CreateCourseInput, UpdateCourseInput } from "../validations/course.validation.js";

export interface CourseRecord extends QueryResultRow {
  _id: string; // API compatibility with the original React frontend
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const columns = `id::text AS "_id", title, description, price,
  thumbnail_url AS "thumbnailUrl", created_at AS "createdAt", updated_at AS "updatedAt"`;

export async function listCourses(): Promise<CourseRecord[]> {
  const result = await pool.query<CourseRecord>(`SELECT ${columns} FROM courses ORDER BY created_at DESC, id DESC`);
  return result.rows;
}

export async function findCourse(id: string): Promise<CourseRecord | null> {
  const result = await pool.query<CourseRecord>(`SELECT ${columns} FROM courses WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function courseExists(id: string): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>("SELECT EXISTS(SELECT 1 FROM courses WHERE id = $1) AS exists", [id]);
  return result.rows[0]?.exists ?? false;
}

export async function insertCourse(data: CreateCourseInput): Promise<CourseRecord> {
  const result = await pool.query<CourseRecord>(
    `INSERT INTO courses (title, description, price, thumbnail_url)
     VALUES ($1, $2, $3, $4) RETURNING ${columns}`,
    [data.title, data.description, data.price, data.thumbnailUrl],
  );
  return result.rows[0];
}

export async function patchCourse(id: string, data: UpdateCourseInput): Promise<CourseRecord | null> {
  const allowed = [
    ["title", "title"], ["description", "description"],
    ["price", "price"], ["thumbnailUrl", "thumbnail_url"],
  ] as const;
  const changed = allowed.filter(([field]) => data[field] !== undefined);
  const setters = changed.map(([, column], index) => `${column} = $${index + 2}`);
  const values = changed.map(([field]) => data[field]);
  const result = await pool.query<CourseRecord>(
    `UPDATE courses SET ${[...setters, "updated_at = NOW()"].join(", ")}
     WHERE id = $1 RETURNING ${columns}`,
    [id, ...values],
  );
  return result.rows[0] ?? null;
}

/** FK ON DELETE CASCADE deletes lectures in the same PostgreSQL statement transaction. */
export async function removeCourse(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM courses WHERE id = $1 RETURNING id", [id]);
  return (result.rowCount ?? 0) > 0;
}
