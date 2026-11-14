import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const schema = read("../sql/001_lms_schema.sql");
const courses = read("../src/repositories/course.repository.ts");
const lectures = read("../src/repositories/lecture.repository.ts");
const auth = read("../src/config/auth.ts");
const deps = JSON.parse(read("../package.json"));

test("relational schema defines course and lecture tables", () => {
  assert.match(schema, /CREATE TABLE IF NOT EXISTS courses/i);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS lectures/i);
  assert.match(schema, /course_id UUID NOT NULL REFERENCES courses\(id\) ON DELETE CASCADE/i);
});
test("PostgreSQL enforces valid prices, ordering and unique IDs", () => {
  assert.match(schema, /id UUID PRIMARY KEY DEFAULT gen_random_uuid\(\)/i);
  assert.match(schema, /CHECK \(price >= 0\)/i);
  assert.match(schema, /CHECK \(sort_order >= 0\)/i);
});
test("course and lecture queries use positional parameters", () => {
  assert.match(courses, /WHERE id = \$1/);
  assert.match(lectures, /WHERE id = \$1 AND course_id = \$2/);
  assert.match(courses, /RETURNING/);
  assert.match(lectures, /RETURNING/);
});
test("existing frontend API field names remain compatible", () => {
  assert.match(courses, /AS "_id"/);
  assert.match(courses, /AS "thumbnailUrl"/);
  assert.match(lectures, /AS "courseId"/);
  assert.match(lectures, /AS "order"/);
});
test("Better Auth uses the PostgreSQL pool and Mongo packages are gone", () => {
  assert.match(auth, /database: pool/);
  assert.ok("pg" in deps.dependencies);
  for (const dependency of ["mongoose", "mongodb", "@better-auth/mongo-adapter"]) {
    assert.ok(!(dependency in deps.dependencies));
  }
});
