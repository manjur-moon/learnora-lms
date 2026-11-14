import assert from "node:assert/strict";
import { test } from "node:test";
import { createCourseSchema, updateCourseSchema } from "../src/validations/course.validation.js";
import { createLectureSchema } from "../src/validations/lecture.validation.js";

const course = {
  title: "React Fundamentals",
  description: "Learn React and its core concepts.",
  price: 1500,
  thumbnailUrl: "https://example.com/react.jpg",
};

test("valid course is accepted", () => {
  assert.equal(createCourseSchema.safeParse(course).success, true);
});
test("negative course price is rejected", () => {
  assert.equal(createCourseSchema.safeParse({ ...course, price: -1 }).success, false);
});
test("unexpected course fields are rejected", () => {
  assert.equal(createCourseSchema.safeParse({ ...course, role: "admin" }).success, false);
});
test("invalid course URL is rejected", () => {
  assert.equal(createCourseSchema.safeParse({ ...course, thumbnailUrl: "javascript:alert(1)" }).success, false);
});
test("empty patch is rejected", () => {
  assert.equal(updateCourseSchema.safeParse({}).success, false);
});
test("valid partial patch is accepted", () => {
  assert.deepEqual(updateCourseSchema.parse({ price: 500 }), { price: 500 });
});
test("lecture body cannot set courseId", () => {
  const lecture = {
    title: "React Intro", description: "Learn the React basics.",
    videoUrl: "https://www.youtube.com/watch?v=j942wKiXFu8", order: 1,
  };
  assert.equal(createLectureSchema.safeParse(lecture).success, true);
  assert.equal(createLectureSchema.safeParse({ ...lecture, courseId: "507f1f77bcf86cd799439011" }).success, false);
});
