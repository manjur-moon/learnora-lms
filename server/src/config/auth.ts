import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { pool } from "./db.js";
import { env } from "./env.js";

export const auth = betterAuth({
  appName: "Learnora LMS",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.CLIENT_ORIGIN, env.BETTER_AUTH_URL],
  database: pool, // Better Auth built-in PostgreSQL/Kysely adapter
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] })],
});
