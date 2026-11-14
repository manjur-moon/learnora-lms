import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";
import { courseRouter } from "./routes/course.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

export const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
// Better Auth must receive the raw request before the Express JSON parser.
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      success: true,
      message: "API and database are healthy",
      data: { database: "connected" },
    });
  } catch {
    res.status(503).json({
      success: false,
      message: "Database is unavailable",
      data: { database: "disconnected" },
    });
  }
});
app.use("/api/courses", courseRouter);
app.use("/api/admin", adminRouter);
app.use((_req, res) => res.status(404).json({ success: false, message: "API endpoint not found" }));
app.use(errorHandler);
