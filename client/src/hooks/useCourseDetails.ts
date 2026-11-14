import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getPublicCourse, getPublicLectures } from "../services/course.service";
import type { Course } from "../types/course";
import type { Lecture } from "../types/lecture";

type Status = "loading" | "success" | "error" | "not-found";

function describeError(error: unknown): { status: Status; message: string } {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      return { status: "not-found", message: "We couldn't find that course. It may have been removed." };
    }
    if (!error.response) {
      return { status: "error", message: "The course API is unavailable. Check that Express and PostgreSQL are running." };
    }
    return { status: "error", message: "The course couldn't be loaded right now. Please try again." };
  }
  return {
    status: "error",
    message: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
  };
}

/** Fetches real course and lecture rows, aborting outdated requests. */
export function useCourseDetails(courseId: string | undefined) {
  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCourse(null);
    setLectures([]);
    setStatus("loading");
    setErrorMessage("");

    if (!courseId || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(courseId)) {
      setStatus("not-found");
      setErrorMessage("This course link is invalid.");
      return () => controller.abort();
    }

    Promise.all([
      getPublicCourse(courseId, controller.signal),
      getPublicLectures(courseId, controller.signal),
    ])
      .then(([fetchedCourse, fetchedLectures]) => {
        if (controller.signal.aborted) return;
        setCourse(fetchedCourse);
        setLectures([...fetchedLectures].sort((a, b) =>
          a.order - b.order || a.createdAt.localeCompare(b.createdAt) || a._id.localeCompare(b._id)
        ));
        setStatus("success");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const result = describeError(error);
        setStatus(result.status);
        setErrorMessage(result.message);
      });

    return () => controller.abort();
  }, [courseId, reloadKey]);

  const reload = useCallback(() => setReloadKey((value) => value + 1), []);
  return { course, lectures, status, errorMessage, reload };
}
