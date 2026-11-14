import axios from "axios";
import type { ApiListResponse, Course } from "../types/course";
import type { Lecture } from "../types/lecture";

/**
 * Vite proxies /api to Express locally (vite.config.ts).
 * Deploy /api behind a same-origin reverse proxy in production.
 */
export const http = axios.create({
  baseURL: "/api",
  timeout: 12000,
  withCredentials: true,
});

interface ApiItemResponse<T> {
  success: true;
  data: T;
}

export async function getPublicCourses(signal?: AbortSignal): Promise<Course[]> {
  const response = await http.get<ApiListResponse<Course>>("/courses", { signal });
  if (response.data.success !== true || !Array.isArray(response.data.data)) {
    throw new Error("Unexpected courses API response.");
  }
  return response.data.data;
}

export async function getPublicCourse(courseId: string, signal?: AbortSignal): Promise<Course> {
  const response = await http.get<ApiItemResponse<Course>>(`/courses/${encodeURIComponent(courseId)}`, { signal });
  if (response.data.success !== true || !response.data.data?._id) {
    throw new Error("Unexpected course details API response.");
  }
  return response.data.data;
}

export async function getPublicLectures(courseId: string, signal?: AbortSignal): Promise<Lecture[]> {
  const response = await http.get<ApiListResponse<Lecture>>(
    `/courses/${encodeURIComponent(courseId)}/lectures`, { signal }
  );
  if (response.data.success !== true || !Array.isArray(response.data.data)) {
    throw new Error("Unexpected course lectures API response.");
  }
  return response.data.data;
}
