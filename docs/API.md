# Learnora LMS — API contract

All LMS endpoints respond with `{ "success": true, "data": ... }` on success and
`{ "success": false, "message": ... }` on errors, except 204 responses with no body.

## Public API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | PostgreSQL readiness |
| GET | `/api/courses` | All courses, most recent first |
| GET | `/api/courses/:courseId` | Course details |
| GET | `/api/courses/:courseId/lectures` | Lectures sorted by order |

## Admin API (Better Auth session with admin role required)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/admin/me` | Verify admin authorization |
| POST | `/api/admin/courses` | Create course |
| PATCH | `/api/admin/courses/:courseId` | Update course |
| DELETE | `/api/admin/courses/:courseId` | Delete course and dependent lectures |
| POST | `/api/admin/courses/:courseId/lectures` | Create lecture |
| PATCH | `/api/admin/courses/:courseId/lectures/:lectureId` | Update lecture |
| DELETE | `/api/admin/courses/:courseId/lectures/:lectureId` | Delete lecture |

## Auth (Better Auth)

- `POST /api/auth/sign-in/email`
- `GET /api/auth/get-session`
- `POST /api/auth/sign-out`
- Public sign-up is disabled. Create the first admin through the CLI.

## Status codes

- GET/PATCH success: 200; POST created: 201; DELETE success: 204.
- Invalid body or malformed UUID: 400; unauthenticated: 401; unauthorized: 403;
  not found: 404; unforeseen server failure: 500.

## Course payload

```json
{
  "title": "React Fundamentals",
  "description": "Learn React and TypeScript hands-on.",
  "price": 1500,
  "thumbnailUrl": "https://example.com/react.jpg"
}
```

## Lecture payload

```json
{
  "title": "Introduction to React",
  "description": "An overview of React and components.",
  "videoUrl": "https://www.youtube.com/watch?v=j942wKiXFu8",
  "order": 1
}
```

**ID migration:** Courses and lectures now use PostgreSQL UUIDs, e.g.
`50a5bd0f-cd5b-4c2f-8dc9-d96e4ced69a9` instead of 24-character MongoDB ObjectIds.
For compatibility with the React application, the API still returns `_id` and `courseId`
properties; no MongoDB driver is involved.

**Deletion semantics:** `lectures.course_id` has a foreign key with `ON DELETE CASCADE`;
PostgreSQL guarantees dependent lecture deletion together with the course.
