import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { ShieldX, LoaderCircle } from "lucide-react";
import { authClient, hasAdminRole } from "../../lib/auth-client";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { data: session, isPending, error } = authClient.useSession();
  const location = useLocation();

  if (isPending) {
    return (
      <main className="admin-fullscreen-state" role="status" aria-live="polite">
        <LoaderCircle className="admin-spin" size={28} />
        <p>Checking administrator session…</p>
      </main>
    );
  }
  if (error) {
    return (
      <main className="admin-fullscreen-state" role="alert">
        <ShieldX size={30} />
        <h1>Unable to verify your session</h1>
        <p>Check your connection to the backend and refresh this page.</p>
        <button type="button" onClick={() => window.location.reload()} className="admin-btn admin-btn--primary">Try again</button>
      </main>
    );
  }
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!hasAdminRole(session.user.role)) {
    return (
      <main className="admin-fullscreen-state" role="alert">
        <ShieldX size={34} />
        <h1>Administrator access required</h1>
        <p>This account is signed in but does not have the admin role.</p>
        <Link className="admin-btn admin-btn--primary" to="/">Back to homepage</Link>
      </main>
    );
  }
  return <>{children}</>;
}
