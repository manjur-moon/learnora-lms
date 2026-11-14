/** PostgreSQL lecture UUID; courseId references a course UUID. */
export interface Lecture {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}
