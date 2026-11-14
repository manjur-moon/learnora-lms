# Learnora LMS — PostgreSQL Edition

**Interview-ready source conversion** of the existing Simplified LMS frontend and APIs.
Original user-approved visual design is preserved. The backend now uses PostgreSQL rather
than MongoDB Atlas or Mongoose.

> **Verification status:** Source-level parsing/import checks and database-contract
> tests are provided. Full npm installation, production build, live PostgreSQL/Better Auth
> login, CRUD integration and cloud deployment **must be run with your database URL**.
> No real credentials are bundled. An explicitly labeled example course/lecture dataset is supplied for evaluator setup.

## Stack

- **Frontend:** React 19, Vite, TypeScript, React Router 7 and Tailwind CSS 4.
- **Backend:** Node.js 22+, Express 5 and TypeScript.
- **Database:** PostgreSQL via `pg` connection pooling, SQL schema migration and parameterized queries.
- **Authentication:** Better Auth + Admin plugin, backed by the same PostgreSQL pool.
- **Validation:** Zod; UUID route parameters, field length, price and order bounds.
- **Data integrity:** foreign key (`lectures.course_id`) with `ON DELETE CASCADE`.

## Features

Public homepage, responsive visual sections, courses listing, details and lecture video
player. Admin email/password login with protected course and lecture CRUD. Public signup,
student enrollment, payments and instructor management are intentionally excluded.

## Database schema

```text
courses                       lectures
---------------------         -------------------------
id UUID PK  <---------------  course_id UUID FK
  title                       id UUID PK
  description                 title
  price INTEGER               description
  thumbnail_url               video_url
  created_at                  sort_order INTEGER
  updated_at                  created_at / updated_at
                              ON DELETE CASCADE

Better Auth separately creates its user/session/account/verification tables.
```

**API compatibility:** Database UUIDs are returned as `_id` and `courseId`, so the existing
React services and components continue to work. The client and API ID validators now
expect UUIDs instead of MongoDB ObjectIds.

## Updating an existing MongoDB project

Prefer the **Full ZIP**: extract into a NEW folder to prevent stale MongoDB source from
remaining. An **Update-Only ZIP** is provided for developers who must overlay an existing
project. After overlaying update-only files, from the project root run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-mongodb.ps1
```

Then update `server/.env` to use `DATABASE_URL`, remove the old `MONGODB_URI` line, run
`npm install`, run both migrations and create an admin. See the steps below. Do not
expect the old MongoDB data to appear automatically in PostgreSQL.

## 1. Create a cloud PostgreSQL database

Use **Neon** (https://console.neon.tech/) for a straightforward managed Postgres database.
Create a project, select a region, then open **Connect** and copy the **connection string**.
Do not copy only the hostname. The URL commonly looks like:

```text
postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

An equivalent PostgreSQL database (e.g. Supabase or managed Postgres) also works. Keep TLS
enabled. Note: moving from Atlas to Postgres changes the service and connectivity path;
it does **not** guarantee that an underlying PC-wide TLS/network issue is gone.

## 2. Install dependencies

From the extracted project root in Windows PowerShell:

```powershell
npm install
```

## 3. Configure environment variables

Create `server/.env` from `server/.env.example` and replace the placeholder values:

```dotenv
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
CLIENT_ORIGIN=http://localhost:5173
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=YOUR_RANDOM_SECRET_WITH_AT_LEAST_32_CHARACTERS
```

Generate a Better Auth secret:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
```

Windows first-time setup alternative:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\configure-postgres.ps1
```

The script asks privately for your PostgreSQL URL and creates `server/.env`. If you already
have `server/.env` from the MongoDB version, **edit it manually**: replace `MONGODB_URI` with
`DATABASE_URL` containing your Postgres URL; keep the existing Better Auth secret if you wish.
The script deliberately does not overwrite existing secrets.

## 4. Apply database migrations (required, once per new database)

From the project root:

```powershell
npm run db:ping
npm run db:migrate
npm run auth:migrate
```

- `db:ping` verifies basic PostgreSQL connectivity.
- `db:migrate` runs the idempotent `server/sql/001_lms_schema.sql` for LMS tables.
- `auth:migrate` asks Better Auth's CLI to create its authentication tables in PostgreSQL.

**Do not skip `auth:migrate`.** Without those tables login and sessions fail, even if
`db:ping` succeeds. The auth migrations use Better Auth's built-in Kysely PostgreSQL
adapter. These are separate from LMS schema migration.

## 5. Provision the first admin

Public sign-up is disabled by design. From the project root:

```powershell
cd server
npm run admin:create -- --email your-email@example.com --name "LMS Admin" --role admin
cd ..
```

The CLI prompts for a password. Use your own email; **never expose credentials in GitHub**.

## 6. Database setup & sample data (for evaluators)

**Requirement 4 — "Seed data or instructions to create initial data"** is fulfilled by the
committed SQL file [`server/sql/002_demo_seed.sql`](server/sql/002_demo_seed.sql)
plus the commands below. This is a repeatable, **non-destructive** setup: it adds
**4 sample courses and 8 lectures**, without creating demo credentials or altering
existing admin users. The SQL uses fixed UUIDs, a transaction and `ON CONFLICT (id)
DO NOTHING`, so rerunning it does not create duplicates. The referenced video
clips belong to external creators; playback/embedding must be checked in the live app.

### A. Start from a fresh PostgreSQL database

1. Create a Neon PostgreSQL project and copy its **direct** connection string.
2. From the repository root, run `npm install` and create `server/.env` from
   `server/.env.example`. Set `DATABASE_URL`, `CLIENT_ORIGIN`, `BETTER_AUTH_URL`,
   and a unique `BETTER_AUTH_SECRET` (at least 32 characters). **Do not commit `.env`.**
3. Run the following in order **from the repository root**:

```powershell
npm run db:ping
npm run db:migrate
npm run auth:migrate
npm run db:seed:preview
npm run db:seed
npm run db:seed:verify
```

`auth:migrate` creates Better Auth tables (`user`, `session`, `account`,
`verification`); confirm its prompt if asked. The seed only inserts course and
lecture records and **never** creates an admin/password.

4. To create an admin **in a development/evaluator database**, use:

```powershell
cd server
npm run admin:create -- --email YOUR_EMAIL --name "LMS Admin" --role admin
cd ..
```

Enter the password at the private prompt; never add credentials to the repository.
Visit `/admin/login` after starting the app. Public course browsing needs no login.

### B. Alternative: run the seed directly in Neon SQL Editor

After `npm run db:migrate` (and the independent `npm run auth:migrate` for login),
open the correct Neon **project, branch and database** → **SQL Editor**. Paste the
complete contents of [`server/sql/002_demo_seed.sql`](server/sql/002_demo_seed.sql)
and click **Run**. This produces the same data as `npm run db:seed`.

### C. Verify initial data

Either run `npm run db:seed:verify` or execute this read-only query in Neon SQL Editor:

```sql
SELECT c.title, COUNT(l.id) AS demo_lectures
FROM courses AS c
LEFT JOIN lectures AS l ON l.course_id = c.id
  AND l.id IN (
    'b11ce001-2026-4000-8000-000000000001'::uuid,
    'b11ce002-2026-4000-8000-000000000002'::uuid,
    'b11ce003-2026-4000-8000-000000000003'::uuid,
    'b11ce004-2026-4000-8000-000000000004'::uuid,
    'b11ce005-2026-4000-8000-000000000005'::uuid,
    'b11ce006-2026-4000-8000-000000000006'::uuid,
    'b11ce007-2026-4000-8000-000000000007'::uuid,
    'b11ce008-2026-4000-8000-000000000008'::uuid
  )
WHERE c.id IN (
  'a11ce001-2026-4000-8000-000000000001'::uuid,
  'a11ce002-2026-4000-8000-000000000002'::uuid,
  'a11ce003-2026-4000-8000-000000000003'::uuid,
  'a11ce004-2026-4000-8000-000000000004'::uuid
)
GROUP BY c.id, c.title ORDER BY c.title;
```

Expected: **4 rows, each with 2 lectures**. `GET /api/courses` should now show
courses; open a course page and test video playback separately.

**Caution:** The commands operate on **whichever database `server/.env` points to**.
Check the Neon project/branch before running them. Do not run destructive E2E
scripts against a shared or production database. If sample data is no longer wanted,
remove only those courses through the admin UI (their lectures are cascade-deleted).

[More details and troubleshooting](docs/SEED-DATA.md).

## 7. Run the application

```powershell
npm run dev
```

- Website: http://localhost:5173
- Courses: http://localhost:5173/courses
- Admin Login: http://localhost:5173/admin/login
- Backend check: http://localhost:5000/api/health

## 8. Verify before interviewer submission

```powershell
npm run qa:static
npm run check
npm run build
npm test
```

With the backend running, and **ONLY against your local test instance and test database**:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test-e2e.ps1
```

This exercises health, anonymous protection, admin login, course creation/edit/deletion,
lecture creation/edit, cascade path and logout. It creates temporary records; do not run
it against production. Verify cleanup afterwards.

## Folder structure

```text
client/src/                         React pages, UI components, hooks and API services
server/src/config/                  PostgreSQL pool, environment and Better Auth
server/src/controllers/             Express HTTP handlers
server/src/repositories/            Parameterized PostgreSQL CRUD queries
server/src/routes/                  Public and admin-protected routes
server/src/middleware/              Validation, authorization and errors
server/src/validations/             Zod request schemas
server/sql/001_lms_schema.sql       Postgres DDL with CASCADE FK and indexes
server/scripts/migrate.ts           LMS SQL migration runner
server/scripts/seed.ts              Idempotent SQL seed runner
server/scripts/verify-seed.ts       Read-only seed verification runner
server/sql/002_demo_seed.sql        Reviewer sample courses and lectures
server/scripts/ping.ts              Postgres connectivity check
server/tests/                       Schema contract and validation tests
scripts/                             Windows setup and API QA scripts
docs/API.md                         Complete API reference
```

## Production deployment (Vercel + Render + Neon)

**Frontend on Vercel, API + Better Auth on Render, database on existing Neon.**
The browser calls same-origin `/api`; Vercel `vercel.json` proxies these requests
server-side to Render. This avoids the third-party-cookie issues of making direct
cross-site authentication requests from the browser.

See **[PRODUCTION-DEPLOYMENT.md](PRODUCTION-DEPLOYMENT.md)** for the required
Render-first deployment order, Vercel settings, environment variables, and tests.
**Important:** `vercel.json` is configured for the known Render API origin
`https://learnora-lms.onrender.com`. If the Render service URL changes, update it before
Vercel deployment. Test `npm run check`, `npm run build`, `npm test`, and
`npm run check:deploy` before pushing.

Use `npm run smoke:production -- https://YOUR_VERCEL_URL` after deployment.
This is not considered production-verified until the actual URL and login flow are tested.

## Known limitations

- This is a clean PostgreSQL replacement, **not a data importer**. MongoDB Atlas courses,
  lectures and admin accounts do not automatically transfer to PostgreSQL.
- Course and lecture URLs now use UUIDs. Old MongoDB ObjectId-based URLs will not resolve.
- PostgreSQL's `price` is an integer BDT display value; it is not an actual payment.
- Third-party media and YouTube/Vimeo embeds depend on external hosting and permissions.
- No dependency lockfile is bundled because package installation could not be completed
  in the build environment. Run `npm install` and commit the resulting lockfile.

## Resources

- [PostgreSQL adapter — Better Auth](https://better-auth.com/docs/adapters/postgresql)
- [Better Auth CLI migration](https://better-auth.com/docs/concepts/cli)
- [Neon connection string](https://neon.com/docs/connect/connect-from-any-app)
- [LMS API reference](docs/API.md)
