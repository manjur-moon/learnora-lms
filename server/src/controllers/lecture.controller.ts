import type { RequestHandler } from "express";
import { courseExists } from "../repositories/course.repository.js";
import {
  listLectures, insertLecture, patchLecture, removeLecture,
} from "../repositories/lecture.repository.js";
import { AppError } from "../utils/app-error.js";
import type { CreateLectureInput, UpdateLectureInput } from "../validations/lecture.validation.js";

async function ensureCourseExists(courseId: string): Promise<void> {
  if (!(await courseExists(courseId))) throw new AppError(404, "Course not found");
}

export const getLecturesByCourse: RequestHandler = async (req, res) => {
  const courseId = req.params.courseId as string;
  await ensureCourseExists(courseId);
  res.status(200).json({ success: true, data: await listLectures(courseId) });
};
export const createLecture: RequestHandler = async (req, res) => {
  const courseId = req.params.courseId as string;
  const data = res.locals.validatedBody as CreateLectureInput;
  await ensureCourseExists(courseId);
  const lecture = await insertLecture(courseId, data);
  res.status(201).json({ success: true, data: lecture });
};
export const updateLecture: RequestHandler = async (req, res) => {
  const courseId = req.params.courseId as string;
  await ensureCourseExists(courseId);
  const lecture = await patchLecture(courseId, req.params.lectureId as string, res.locals.validatedBody as UpdateLectureInput);
  if (!lecture) throw new AppError(404, "Lecture not found");
  res.status(200).json({ success: true, data: lecture });
};
export const deleteLecture: RequestHandler = async (req, res) => {
  const courseId = req.params.courseId as string;
  await ensureCourseExists(courseId);
  if (!(await removeLecture(courseId, req.params.lectureId as string))) throw new AppError(404, "Lecture not found");
  res.status(204).send();
};
