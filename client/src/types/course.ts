/** PostgreSQL UUID is exposed as _id for compatibility with the existing UI. */
export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiListResponse<T> {
  success: true;
  data: T[];
}
