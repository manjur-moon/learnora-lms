import "dotenv/config";
import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z.string().regex(/^postgres(?:ql)?:\/\//, "A PostgreSQL connection URL is required"),
  CLIENT_ORIGIN: z.url(),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
});

const parsed = environmentSchema.safeParse(process.env);
if (!parsed.success) {
  const fields = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Invalid environment configuration: ${fields}`);
}

export const env = parsed.data;
