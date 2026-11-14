import { z } from "zod";
import { isValidHttpUrl } from "../utils/validators.js";

const httpUrl = z.string().trim().max(2048).refine(isValidHttpUrl, "Invalid HTTP/HTTPS URL");

export const createCourseSchema = z.strictObject({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  price: z.number().int().nonnegative().max(2_147_483_647),
  thumbnailUrl: httpUrl,
});

export const updateCourseSchema = createCourseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Provide at least one field to update",
);

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
