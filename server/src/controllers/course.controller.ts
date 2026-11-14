import type { RequestHandler } from "express";
import { AppError } from "../utils/app-error.js";
import {
  listCourses, findCourse, insertCourse, patchCourse, removeCourse,
} from "../repositories/course.repository.js";
import type { CreateCourseInput, UpdateCourseInput } from "../validations/course.validation.js";

export const getCourses: RequestHandler = async (_req, res) => {
  res.status(200).json({ success: true, data: await listCourses() });
};
export const getCourseById: RequestHandler = async (req, res) => {
  const course = await findCourse(req.params.courseId as string);
  if (!course) throw new AppError(404, "Course not found");
  res.status(200).json({ success: true, data: course });
};
export const createCourse: RequestHandler = async (_req, res) => {
  const data = res.locals.validatedBody as CreateCourseInput;
  const course = await insertCourse(data);
  res.status(201).json({ success: true, data: course });
};
export const updateCourse: RequestHandler = async (req, res) => {
  const data = res.locals.validatedBody as UpdateCourseInput;
  const course = await patchCourse(req.params.courseId as string, data);
  if (!course) throw new AppError(404, "Course not found");
  res.status(200).json({ success: true, data: course });
};
export const deleteCourse: RequestHandler = async (req, res) => {
  if (!(await removeCourse(req.params.courseId as string))) throw new AppError(404, "Course not found");
  res.status(204).send();
};
