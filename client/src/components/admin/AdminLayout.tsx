import { useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { BookOpen, LayoutDashboard, LogOut, ArrowUpRight, Flower2, Menu, X, Plus, LibraryBig } from "lucide-react";
import { authClient } from "../../lib/auth-client";

const items = [
  { label: "Overview", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Courses", to: "/admin/courses", icon: LibraryBig },
] as const;

export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      navigate("/admin/login", { replace: true });
    } catch {
      setLogoutError("Could not sign out. Try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="admin-app">
      <aside className={`admin-sidebar${mobileMenu ? " admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__brand">
          <Link to="/" aria-label="Learnora home" onClick={() => setMobileMenu(false)}><Flower2 size={24} strokeWidth={1.35} /> Learnora<span>STUDIO</span></Link>
          <button className="admin-sidebar__close" type="button" aria-label="Close menu" onClick={() => setMobileMenu(false)}><X size={19}/></button>
        </div>
        <p className="admin-sidebar__eyebrow">MANAGEMENT</p>
        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {items.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setMobileMenu(false)} className={({ isActive }) => `admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`}>
              <Icon size={19} strokeWidth={1.7}/>{label}
            </NavLink>
          ))}
        </nav>
        <Link className="admin-sidebar__new" to="/admin/courses/new" onClick={() => setMobileMenu(false)}><Plus size={17}/> New course</Link>
        <div className="admin-sidebar__bottom">
          <Link className="admin-sidebar__site" to="/courses" target="_blank" rel="noreferrer">View student site <ArrowUpRight size={16}/></Link>
          <button type="button" className="admin-sidebar__logout" onClick={() => void handleLogout()} disabled={loggingOut}><LogOut size={17}/>{loggingOut ? "Signing out…" : "Sign out"}</button>
          {logoutError && <p role="alert" className="admin-small-error">{logoutError}</p>}
        </div>
      </aside>
      {mobileMenu && <button type="button" className="admin-sidebar__scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation" />}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button className="admin-menu-toggle" type="button" aria-label="Open navigation" onClick={() => setMobileMenu(true)}><Menu size={22}/></button>
            <BookOpen size={16}/><span>LEARNORA / CONTENT STUDIO</span>
          </div>
          <div className="admin-topbar__right"><span className="admin-user-dot" aria-hidden="true"/><span>{session?.user.name || "Administrator"}</span></div>
        </header>
        <div className="admin-main__body">{children}</div>
      </div>
    </div>
  );
}
