import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/**
 * Auth requests go to /api/auth on the current origin.
 * Vite proxies /api locally; production should proxy /api to Express.
 * This keeps auth cookies first-party and out of localStorage.
 */
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export function hasAdminRole(role: string | null | undefined): boolean {
  return (role ?? "").split(",").some((entry) => entry.trim() === "admin");
}
