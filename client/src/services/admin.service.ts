import axios from "axios";
import { http } from "./course.service";
import type { Course } from "../types/course";
import type { Lecture } from "../types/lecture";
import type { CourseFormValues, LectureFormValues } from "../validations/admin-forms";

type ResourceResult<T> = { success: true; data: T };

export async function createAdminCourse(data: CourseFormValues): Promise<Course> {
  const result = await http.post<ResourceResult<Course>>("/admin/courses", data);
  return result.data.data;
}
export async function updateAdminCourse(id: string, data: CourseFormValues): Promise<Course> {
  const result = await http.patch<ResourceResult<Course>>(`/admin/courses/${encodeURIComponent(id)}`, data);
  return result.data.data;
}
export async function deleteAdminCourse(id: string): Promise<void> {
  await http.delete(`/admin/courses/${encodeURIComponent(id)}`);
}
export async function createAdminLecture(courseId: string, data: LectureFormValues): Promise<Lecture> {
  const result = await http.post<ResourceResult<Lecture>>(`/admin/courses/${encodeURIComponent(courseId)}/lectures`, data);
  return result.data.data;
}
export async function updateAdminLecture(courseId: string, lectureId: string, data: LectureFormValues): Promise<Lecture> {
  const result = await http.patch<ResourceResult<Lecture>>(
    `/admin/courses/${encodeURIComponent(courseId)}/lectures/${encodeURIComponent(lectureId)}`, data
  );
  return result.data.data;
}
export async function deleteAdminLecture(courseId: string, lectureId: string): Promise<void> {
  await http.delete(`/admin/courses/${encodeURIComponent(courseId)}/lectures/${encodeURIComponent(lectureId)}`);
}

/** User-readable error text; detailed server errors are not rendered verbatim. */
export function getAdminErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Cannot reach the API. Check the backend and network connection.";
    const status = error.response.status;
    if (status === 401) return "Your session has expired. Please sign in again.";
    if (status === 403) return "This account is not authorized for this action.";
    if (status === 404) return "This item no longer exists. Refresh the list.";
    if (status === 400) return "Some fields are invalid. Review the form and try again.";
    return "The request could not be completed. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
