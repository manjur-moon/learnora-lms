import { z } from "zod";
import { isValidHttpUrl } from "../utils/validators.js";

const httpUrl = z.string().trim().max(2048).refine(isValidHttpUrl, "Invalid HTTP/HTTPS URL");

export const createLectureSchema = z.strictObject({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(5).max(2000),
  videoUrl: httpUrl,
  order: z.number().int().nonnegative().max(2_147_483_647).optional(),
});
export const updateLectureSchema = createLectureSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Provide at least one field to update",
);
export type CreateLectureInput = z.infer<typeof createLectureSchema>;
export type UpdateLectureInput = z.infer<typeof updateLectureSchema>;
