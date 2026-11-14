# Learnora LMS — PostgreSQL Edition

**Interview-ready source conversion** of the existing Simplified LMS frontend and APIs.
Original user-approved visual design is preserved. The backend now uses PostgreSQL rather
than MongoDB Atlas or Mongoose.

> **Verification status:** Source-level parsing/import checks and database-contract
> tests are provided. Full npm installation, production build, live PostgreSQL/Better Auth
> login, CRUD integration and cloud deployment **must be run with your database URL**.
> No real credentials or fake sample data are bundled.

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

## 6. Run the application

```powershell
npm run dev
```

- Website: http://localhost:5173
- Courses: http://localhost:5173/courses
- Admin Login: http://localhost:5173/admin/login
- Backend check: http://localhost:5000/api/health

## 7. Verify before interviewer submission

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
**Important:** replace the Render service URL placeholder in `vercel.json` before
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
