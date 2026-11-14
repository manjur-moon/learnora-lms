#!/usr/bin/env node
/** Dependency-free checks for split Vercel/Render deployment. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file) => readFileSync(resolve(root, file), "utf8");
const json = JSON.parse(read("vercel.json"));
const rules = json.rewrites ?? [];
const checks = [
  ["Vercel root builds only frontend workspace", json.buildCommand === "npm run build -w client"],
  ["Vercel output is client/dist", json.outputDirectory === "client/dist"],
  ["First rewrite handles /api", rules[0]?.source === "/api/:path*" && rules[0]?.destination?.endsWith("/api/:path*") && rules[0]?.destination?.startsWith("https://")],
  ["Last rewrite handles React Router", rules.at(-1)?.destination === "/index.html"],
  ["Render builds only backend workspace", read("render.yaml").includes("npm run build -w server")],
  ["Render runs only backend workspace", read("render.yaml").includes("npm run start -w server")],
  ["Render API health route", read("render.yaml").includes("healthCheckPath: /api/health")],
  ["Express Better Auth before JSON parser", read("server/src/app.ts").indexOf('app.all("/api/auth/*splat"') < read("server/src/app.ts").indexOf("app.use(express.json(")],
  ["Frontend API stays relative", read("client/src/services/course.service.ts").includes('baseURL: "/api"')],
  ["Auth client uses current browser origin", !read("client/src/lib/auth-client.ts").includes("baseURL:")],
  ["Trusted origins include browser and API origins", read("server/src/config/auth.ts").includes("trustedOrigins: [env.CLIENT_ORIGIN, env.BETTER_AUTH_URL]")],
];
let failed = false;
for (const [label, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
  if (!passed) failed = true;
}
if (json.rewrites?.[0]?.destination?.includes("replace-with-your-render-service")) {
  console.log("ACTION REQUIRED: Replace the placeholder Render domain in vercel.json before Vercel deployment.");
}
if (failed) process.exitCode = 1;
