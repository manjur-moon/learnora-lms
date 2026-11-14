import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/app-error.js";

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) { next(error); return; }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message }); return;
  }
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ success: false, message: "Invalid JSON request body" }); return;
  }
  // PostgreSQL SQLSTATE; do not expose connection strings or SQL to clients.
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
  if (code === "23503") {
    res.status(404).json({ success: false, message: "Related record not found" }); return;
  }
  if (code === "23514" || code === "22003" || code === "22P02" || code === "23502") {
    res.status(400).json({ success: false, message: "Invalid database value" }); return;
  }
  console.error("Unexpected API error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
};
