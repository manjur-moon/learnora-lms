import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

/** Fallback for unknown frontend routes. */
export function NotFoundPage() {
  return (
    <main className="not-found">
      <div className="not-found__card">
        <p className="not-found__label">404 / PAGE NOT FOUND</p>
        <h1>Nothing to see <em>here.</em></h1>
        <p>The page you requested does not exist. Explore the courses instead.</p>
        <Link to="/courses" className="not-found__back">
          <ArrowLeft size={16} aria-hidden="true" /> View courses
        </Link>
      </div>
    </main>
  );
}
