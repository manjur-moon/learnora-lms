-- Learnora LMS: application tables. Better Auth creates its own auth tables separately.
-- Run with: npm run db:migrate -w server
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(120) NOT NULL CHECK (char_length(btrim(title)) >= 3),
  description VARCHAR(2000) NOT NULL CHECK (char_length(btrim(description)) >= 10),
  price INTEGER NOT NULL CHECK (price >= 0),
  thumbnail_url VARCHAR(2048) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_newest ON courses (created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL CHECK (char_length(btrim(title)) >= 3),
  description VARCHAR(2000) NOT NULL CHECK (char_length(btrim(description)) >= 5),
  video_url VARCHAR(2048) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lectures_course_order
  ON lectures (course_id, sort_order, created_at, id);
