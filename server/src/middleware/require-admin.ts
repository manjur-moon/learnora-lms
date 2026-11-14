import type { RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";

export const requireAdmin: RequestHandler = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    const roles = (session.user.role ?? "").split(",").map((role) => role.trim());
    if (!roles.includes("admin")) {
      res.status(403).json({ success: false, message: "Admin access required" });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};
