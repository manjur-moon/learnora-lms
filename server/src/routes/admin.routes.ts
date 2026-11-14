import { Router } from "express";
import { requireAdmin } from "../middleware/require-admin.js";
import { validateBody, validateUuids } from "../middleware/validate.js";
import { createCourseSchema, updateCourseSchema } from "../validations/course.validation.js";
import { createLectureSchema, updateLectureSchema } from "../validations/lecture.validation.js";
import { createCourse, updateCourse, deleteCourse } from "../controllers/course.controller.js";
import { createLecture, updateLecture, deleteLecture } from "../controllers/lecture.controller.js";

export const adminRouter = Router();
adminRouter.use(requireAdmin);
adminRouter.get("/me", (_req, res) => {
  res.status(200).json({ success: true, message: "Admin access granted" });
});
adminRouter.post("/courses", validateBody(createCourseSchema), createCourse);
adminRouter.patch("/courses/:courseId", validateUuids("courseId"), validateBody(updateCourseSchema), updateCourse);
adminRouter.delete("/courses/:courseId", validateUuids("courseId"), deleteCourse);
adminRouter.post("/courses/:courseId/lectures", validateUuids("courseId"), validateBody(createLectureSchema), createLecture);
adminRouter.patch("/courses/:courseId/lectures/:lectureId", validateUuids("courseId", "lectureId"), validateBody(updateLectureSchema), updateLecture);
adminRouter.delete("/courses/:courseId/lectures/:lectureId", validateUuids("courseId", "lectureId"), deleteLecture);
