import { pool } from "../config/db.js";
import type { QueryResultRow } from "pg";
import type { CreateLectureInput, UpdateLectureInput } from "../validations/lecture.validation.js";

export interface LectureRecord extends QueryResultRow {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const columns = `id::text AS "_id", course_id::text AS "courseId", title, description,
  video_url AS "videoUrl", sort_order AS "order",
  created_at AS "createdAt", updated_at AS "updatedAt"`;

export async function listLectures(courseId: string): Promise<LectureRecord[]> {
  const result = await pool.query<LectureRecord>(
    `SELECT ${columns} FROM lectures WHERE course_id = $1
     ORDER BY sort_order ASC, created_at ASC, id ASC`, [courseId],
  );
  return result.rows;
}

export async function insertLecture(courseId: string, data: CreateLectureInput): Promise<LectureRecord> {
  const result = await pool.query<LectureRecord>(
    `INSERT INTO lectures (course_id, title, description, video_url, sort_order)
     VALUES ($1, $2, $3, $4, $5) RETURNING ${columns}`,
    [courseId, data.title, data.description, data.videoUrl, data.order ?? 0],
  );
  return result.rows[0];
}

export async function patchLecture(
  courseId: string, lectureId: string, data: UpdateLectureInput,
): Promise<LectureRecord | null> {
  const allowed = [
    ["title", "title"], ["description", "description"],
    ["videoUrl", "video_url"], ["order", "sort_order"],
  ] as const;
  const changed = allowed.filter(([field]) => data[field] !== undefined);
  const setters = changed.map(([, column], index) => `${column} = $${index + 3}`);
  const values = changed.map(([field]) => data[field]);
  const result = await pool.query<LectureRecord>(
    `UPDATE lectures SET ${[...setters, "updated_at = NOW()"].join(", ")}
     WHERE id = $1 AND course_id = $2 RETURNING ${columns}`,
    [lectureId, courseId, ...values],
  );
  return result.rows[0] ?? null;
}

export async function removeLecture(courseId: string, lectureId: string): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM lectures WHERE id = $1 AND course_id = $2 RETURNING id", [lectureId, courseId],
  );
  return (result.rowCount ?? 0) > 0;
}
