import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { getPublicCourses } from "../services/course.service";
import type { Course } from "../types/course";

export type LoadState = "loading" | "success" | "error";

export interface CoursesResource {
  courses: Course[];
  loadState: LoadState;
  errorMessage: string;
  reload: () => void;
}

function getLoadError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return "The courses API is unavailable. Start Express and verify its PostgreSQL connection.";
    }
    return error.response.status >= 500
      ? "The course service is having trouble. Please try again."
      : "Courses could not be loaded. Please check the API configuration.";
  }
  return error instanceof Error ? error.message : "Something went wrong loading courses.";
}

/** One request serves both the homepage Featured and Explorer sections. */
export function usePublicCourses(): CoursesResource {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoadState("loading");
    setErrorMessage("");
    getPublicCourses(controller.signal)
      .then((records) => {
        if (controller.signal.aborted) return;
        setCourses(records);
        setLoadState("success");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setErrorMessage(getLoadError(error));
        setLoadState("error");
      });
    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  return { courses, loadState, errorMessage, reload };
}
