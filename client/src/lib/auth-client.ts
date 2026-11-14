import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/**
 * Auth requests go to /api/auth on the current origin.
 * Vite proxies /api locally. In production, Vercel proxies /api to Render.
 * The browser always calls its current origin, keeping auth cookies first-party.
 * Do not point the browser directly to the onrender.com domain.
 */
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export function hasAdminRole(role: string | null | undefined): boolean {
  return (role ?? "").split(",").some((entry) => entry.trim() === "admin");
}
