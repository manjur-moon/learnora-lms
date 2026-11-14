# Learnora LMS — Deploy React to Vercel, Express API to Render, PostgreSQL to Neon

This is the **split deployment** configuration. Vercel hosts the React/Vite site;
Render runs the Express API and self-hosted Better Auth; Neon remains the cloud database.

**Important architecture decision:** The Vercel `vercel.json` file forwards `/api/*`
requests to Render. This is a **rewrite**, not a browser redirect. The browser sees
its Vercel origin for API and authentication requests, so session cookies can remain
first-party (host-only). Avoid switching the React code to fetch directly from
`https://...onrender.com`, as third-party-cookie restrictions can break sessions.

## 0. Test locally before deployment

From the repository root, Node 22.12+:

```powershell
npm install
npm run check
npm run build
npm test
npm run qa:static
npm run check:deploy
```

Commit the generated `package-lock.json`. It makes builds reproducible. Never commit
`server/.env`, database credentials, or authentication secrets.

## 1. Push the entire monorepo to GitHub

Keep `client/`, `server/`, `package.json`, `render.yaml` and `vercel.json` in one repository.
Both hosts must deploy from the **repository root** because this is an npm-workspaces project.

```powershell
git init
git add .
git status
# Inspect: server/.env must NOT appear
git commit -m "Configure Vercel frontend and Render API"
git branch -M main
```

Create an empty GitHub repo, add its URL as `origin`, and `git push -u origin main`.
If using an existing repo, commit and push the changes instead of reinitializing it.

## 2. Deploy the backend on Render FIRST

- Open https://dashboard.render.com/ > **New > Web Service**; connect the GitHub repository.
- **Name:** `learnora-lms-api` (or another unique name).
- **Runtime:** Node.
- **Root Directory:** blank — important for npm workspaces.
- **Build Command:** `npm install --include=dev && npm run build -w server`.
- **Start Command:** `npm run start -w server`.
- **Instance:** paid **Starter** to avoid Free's 15-minute idle spin-down.
- **Health Check:** `/api/health`.
- Node version: 22 or later; root `package.json` declares the minimum.
- Choose a region near Neon when possible.

Environment variables in **Render > Service > Environment**:

```dotenv
NODE_ENV=production
DATABASE_URL=YOUR_EXISTING_NEON_POSTGRESQL_URL
BETTER_AUTH_SECRET=YOUR_EXISTING_SECRET_FROM_SERVER_ENV
CLIENT_ORIGIN=http://localhost:5173
BETTER_AUTH_URL=https://YOUR_ACTUAL_RENDER_SERVICE.onrender.com
```

`CLIENT_ORIGIN=http://localhost:5173` is only a temporary initial value until you know
the Vercel production URL. Update it after Step 3. All values are examples, **never**
commit them to Git. Keep the same Better Auth secret as your local working installation.
Do not specify a fixed `PORT`; Render supplies it automatically.

The Neon database already has courses, lectures, Better Auth tables and your admin.
There is no need to create another database, run migrations again, or recreate the admin.

Wait for the Render deployment to show **Live**. Visit:

```text
https://YOUR_ACTUAL_RENDER_SERVICE.onrender.com/api/health
```

Expected: HTTP 200 and JSON indicating `database: connected`.
The Render root `/` intentionally returns 404 — **Render serves only the API**.

## 3. Wire Vercel's API rewrite to Render

**Before deploying to Vercel**, edit repository-root `vercel.json` and replace:

```text
https://replace-with-your-render-service.onrender.com
```

with the **actual** HTTPS Render service origin (without a trailing slash).
Keep the `/api/:path*` suffix exactly as it is. Commit and push this change.

The API rule must appear **before** the catch-all SPA fallback rule. Do not put
any secrets into `vercel.json`. The Render API URL is a public service address.

## 4. Deploy the frontend on Vercel

- Open https://vercel.com/new and import the SAME GitHub repository.
- **Project Root Directory:** leave blank (repository root).
- **Framework Preset:** Vite.
- **Install Command:** `npm install --include=dev`.
- **Build Command:** `npm run build -w client`.
- **Output Directory:** `client/dist`.
- Click Deploy. Root `vercel.json` also declares these settings.

No frontend `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, or `VITE_API_URL` is needed.
Private database/auth variables belong **only** on Render. Browser requests keep using
`/api` and are forwarded by Vercel to Render.

Example public website: `https://learnora-lms.vercel.app` — use your actual deployment URL.

## 5. Finalize the allowed frontend origin on Render

Update exactly this Render environment variable to your **actual Vercel production URL**:

```dotenv
CLIENT_ORIGIN=https://YOUR_ACTUAL_VERCEL_DOMAIN.vercel.app
```

Render's `BETTER_AUTH_URL` must **remain the actual Render HTTPS origin**:

```dotenv
BETTER_AUTH_URL=https://YOUR_ACTUAL_RENDER_SERVICE.onrender.com
```

Save/redeploy Render to activate the changes. Your Better Auth server includes both
origins in `trustedOrigins`. Be exact: `https://`, correct hostname, no path/trailing slash.
Preview deployment domains are not automatically allowlisted for admin login. For the
interview, test with the stable production URL, not an ephemeral preview URL.

## 6. Verify the production user experience

From project root:

```powershell
npm run smoke:production -- https://YOUR_ACTUAL_VERCEL_DOMAIN.vercel.app
```

This checks the Vercel pages and the `/api` reverse proxy without modifying data.
Also test the Render URL's `/api/health` directly.

Then manually verify with browser Developer Tools (Network / Application tabs):

1. The `/courses` page loads actual Neon records.
2. The login POST goes to `https://YOUR_VERCEL_DOMAIN/api/auth/sign-in/email`, NOT directly to Render.
3. The session cookie is stored for the Vercel frontend domain.
4. Refreshing `/admin/dashboard` preserves the login session.
5. Creating/editing/deleting a temporary course and lecture changes Neon data.
6. A public course page plays its embedded video; logout invalidates the session.
7. Unauthenticated `/api/admin/me` returns HTTP 401 through Vercel.
8. Direct deep links such as `/courses` and `/admin/login` return the React app.

If the backend loads but login returns 403 or ORIGIN_MISMATCH, check that
`CLIENT_ORIGIN` equals the EXACT Vercel URL and `BETTER_AUTH_URL` equals Render.
If cookie/session persistence fails, inspect the login response `Set-Cookie` and
verify the browser's cookie is for the Vercel domain, `Secure` over HTTPS,
and `Path=/`. Do not use `sameSite:none` or `tlsInsecure` as blind fixes.

## Troubleshooting

- Render `/api/health` fails: inspect Render logs and Neon `DATABASE_URL`.
- Vercel `/api/health` fails while Render works: check `vercel.json` proxy URL and redeploy Vercel.
- Vercel shows 404 on browser refresh: verify SPA rewrite and Output Directory.
- Vercel build fails with missing workspace packages: use repository root, not `client/`.
- Login returns 403: check Better Auth trusted origins and Render `CLIENT_ORIGIN`.
- Login succeeds but refresh logs out: check proxy cookie handling and do not call Render directly from the browser.
- Free Render sleeps: choose Starter for unknown interviewer access time.
- Neon Free can autosuspend compute; it persists data but may have a brief cold start.

## Technical considerations for interviews

- Vercel hosts static React bundles, Render hosts the REST API, and Neon stores relational data.
- One Vercel reverse-proxy rule forwards all `/api` requests to Render with no client-side redirect.
- The browser sees a same-origin API while server-side HTTP runs on separate infrastructure.
- Admin-only authorization is enforced server-side via Better Auth sessions and role checks.
- PostgreSQL foreign keys enforce the course/lecture relationship and cascade deletion.

Documentation: https://vercel.com/docs/routing/rewrites ,
https://vercel.com/docs/frameworks/frontend/vite ,
https://render.com/docs/your-first-deploy ,
https://better-auth.com/docs/integrations/express .
