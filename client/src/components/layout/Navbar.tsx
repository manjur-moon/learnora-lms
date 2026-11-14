import { useState } from "react";
import { ArrowUpRight, Flower2, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router";

const links = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "About", to: "/#about" },
  { label: "Admin Login", to: "/admin/login" },
] as const;

/** Hash-aware navigation prevents Home and About appearing active together. */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  function isCurrent(to: string): boolean {
    if (to === "/#about") return location.pathname === "/" && location.hash === "#about";
    if (to === "/") return location.pathname === "/" && location.hash !== "#about";
    if (to === "/courses") return location.pathname === "/courses" || location.pathname.startsWith("/courses/");
    return location.pathname.startsWith("/admin");
  }

  return (
    <header className="hero-header">
      <div className="hero-shell hero-header__inner">
        <Link className="brand" to="/" aria-label="Learnora home">
          <Flower2 aria-hidden="true" size={27} strokeWidth={1.3} />
          <span>Learnora</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => {
            const active = isCurrent(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? "page" : undefined}
                className={`nav-pill${active ? " nav-pill--active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link className="nav-cta" to="/courses">
          Explore Courses <ArrowUpRight size={16} aria-hidden="true" />
        </Link>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isCurrent(link.to) ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/courses" onClick={() => setMobileOpen(false)}>
            Explore Courses
          </Link>
        </nav>
      )}
    </header>
  );
}
