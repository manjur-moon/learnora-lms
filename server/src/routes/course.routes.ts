import { Router } from "express";
import { getCourseById, getCourses } from "../controllers/course.controller.js";
import { getLecturesByCourse } from "../controllers/lecture.controller.js";
import { validateUuids } from "../middleware/validate.js";

export const courseRouter = Router();
courseRouter.get("/", getCourses);
courseRouter.get("/:courseId", validateUuids("courseId"), getCourseById);
courseRouter.get("/:courseId/lectures", validateUuids("courseId"), getLecturesByCourse);
