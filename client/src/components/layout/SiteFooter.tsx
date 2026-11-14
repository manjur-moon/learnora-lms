import { ArrowUpRight, Flower2, MoveUpRight } from "lucide-react";
import { Link } from "react-router";

const exploreLinks = [
  { label: "Home", to: "/" },
  { label: "All courses", to: "/courses" },
  { label: "Featured courses", to: "/#featured-courses" },
] as const;

const discoverLinks = [
  { label: "About Learnora", to: "/#about" },
  { label: "Learning gallery", to: "/#learning-gallery" },
  { label: "Admin login", to: "/admin/login" },
] as const;

/** Shared across public pages; no fake social links, contact details or newsletter. */
export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer__shell">
        <div className="site-footer__top">
          <div className="site-footer__identity">
            <Link className="site-footer__brand" to="/" aria-label="Learnora homepage">
              <Flower2 size={34} strokeWidth={1.3} aria-hidden="true" />
              <span>Learnora</span>
            </Link>
            <p>For the thinkers, the makers and the endlessly curious. Your next discovery begins here.</p>
            <span className="site-footer__signature">AN OPEN SPACE TO LEARN</span>
          </div>

          <nav className="site-footer__navigation" aria-label="Footer navigation">
            <div className="site-footer__link-group">
              <h3>Explore</h3>
              {exploreLinks.map(({ label, to }) => (
                <Link to={to} key={to}>{label}</Link>
              ))}
            </div>
            <div className="site-footer__link-group">
              <h3>Discover</h3>
              {discoverLinks.map(({ label, to }) => (
                <Link to={to} key={to}>{label}</Link>
              ))}
            </div>
          </nav>

          <div className="site-footer__invitation">
            <span className="site-footer__invite-label">STILL CURIOUS?</span>
            <p>Find a course that makes you want to know more.</p>
            <Link className="site-footer__invite-link" to="/courses">
              Browse all courses
              <MoveUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="site-footer__wordmark" aria-hidden="true">Learnora<span>✳</span></div>

        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} Learnora. Made for curious minds.</span>
          <span className="site-footer__bottom-center">EXPLORE · PRACTICE · BECOME</span>
          <Link to="/" className="site-footer__bottom-link">
            Back to home <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
