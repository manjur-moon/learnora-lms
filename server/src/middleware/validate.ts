import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validateBody = (schema: ZodType): RequestHandler => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    });
    return;
  }
  res.locals.validatedBody = parsed.data;
  next();
};

export const validateUuids = (...fields: string[]): RequestHandler => (req, res, next) => {
  for (const field of fields) {
    const value = req.params[field];
    if (typeof value !== "string" || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)) {
      res.status(400).json({ success: false, message: `Invalid ${field}` });
      return;
    }
  }
  next();
};
