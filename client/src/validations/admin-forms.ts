import { z } from "zod";

const httpUrl = z.string().trim().max(2048, "URL must be 2048 characters or fewer").refine((raw) => {
  try {
    const parsed = new URL(raw);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}, "Enter a valid http:// or https:// URL");

export const courseFormSchema = z.object({
  title: z.string().trim().min(3, "At least 3 characters are required").max(120),
  description: z.string().trim().min(10, "At least 10 characters are required").max(2000),
  price: z.number({ error: "Enter a valid price" }).int("Price must be a whole number").min(0, "Price cannot be negative"),
  thumbnailUrl: httpUrl,
});

export const lectureFormSchema = z.object({
  title: z.string().trim().min(3, "At least 3 characters are required").max(150),
  description: z.string().trim().min(5, "At least 5 characters are required").max(2000),
  videoUrl: httpUrl,
  order: z.number({ error: "Enter a valid order" }).int("Order must be a whole number").min(0, "Order cannot be negative"),
});

export const loginFormSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
export type LectureFormValues = z.infer<typeof lectureFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
