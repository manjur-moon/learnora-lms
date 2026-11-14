import { useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, RotateCcw, Sparkles } from "lucide-react";
import { Link } from "react-router";
import type { CoursesResource } from "../../hooks/usePublicCourses";
import type { Course } from "../../types/course";

const priceFormatter = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
});

function CourseExplorerRow({ course, index }: { course: Course; index: number }) {
  const [imageError, setImageError] = useState(false);
  const priceLabel = course.price === 0 ? "Free" : `৳ ${priceFormatter.format(course.price)}`;

  return (
    <article className="course-explorer__row">
      <span className="course-explorer__number" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="course-explorer__row-title">
        <span className="course-explorer__row-eyebrow">Self-paced learning</span>
        <h3>{course.title}</h3>
      </div>
      <div className="course-explorer__preview" aria-hidden="true">
        {imageError ? (
          <div className="course-explorer__preview-fallback"><BookOpen size={26} /></div>
        ) : (
          <img
            src={course.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      <p className="course-explorer__summary">{course.description}</p>
      <span className="course-explorer__price" aria-label={`Course price: ${priceLabel}`}>
        {priceLabel}
      </span>
      <Link
        className="course-explorer__row-link"
        to={`/courses/${course._id}`}
        aria-label={`View details for ${course.title}`}
      >
        View Course <ArrowUpRight size={15} aria-hidden="true" />
      </Link>
    </article>
  );
}

export function CourseExplorer({ resource }: { resource: CoursesResource }) {
  const { courses, loadState, errorMessage, reload } = resource;
  const visibleCourses = courses.slice(0, 6);

  return (
    <section className="course-explorer" id="course-explorer" aria-labelledby="course-explorer-title">
      <div className="course-explorer__wash" aria-hidden="true" />
      <div className="course-explorer__inner">
        <div className="course-explorer__heading">
          <span className="course-explorer__eyebrow">
            <Sparkles size={12} aria-hidden="true" /> YOUR NEXT STEP
          </span>
          <h2 id="course-explorer-title">
            Your Curiosity, <em>Your Path.</em>
          </h2>
          <p>Take a closer look at what you could learn. Each course is an open door to new ideas.</p>
        </div>

        <div className="course-explorer__panel">
          <div className="course-explorer__panel-top">
            <span>THE COURSE EDITION</span>
            <span>{loadState === "success" ? `${courses.length} course${courses.length === 1 ? "" : "s"} available` : "Learn something new"}</span>
          </div>

          {loadState === "loading" && (
            <div className="course-explorer__loading" role="status" aria-label="Loading available courses">
              {[0, 1, 2, 3].map((index) => (
                <div className="course-explorer__skeleton" key={index} aria-hidden="true">
                  <span /> <span /> <span />
                </div>
              ))}
              <span className="sr-only">Loading courses…</span>
            </div>
          )}

          {loadState === "error" && (
            <div className="course-explorer__state" role="alert">
              <BookOpen size={30} strokeWidth={1.5} aria-hidden="true" />
              <h3>Couldn't open the course collection.</h3>
              <p>{errorMessage}</p>
              <button type="button" onClick={reload}>
                <RotateCcw size={15} aria-hidden="true" /> Try again
              </button>
            </div>
          )}

          {loadState === "success" && visibleCourses.length === 0 && (
            <div className="course-explorer__state" role="status">
              <BookOpen size={30} strokeWidth={1.5} aria-hidden="true" />
              <h3>Our collection is taking shape.</h3>
              <p>When the admin publishes courses, they will appear right here.</p>
            </div>
          )}

          {loadState === "success" && visibleCourses.length > 0 && (
            <div className="course-explorer__list" aria-label="Browse latest courses">
              {visibleCourses.map((course, index) => (
                <CourseExplorerRow key={course._id} course={course} index={index} />
              ))}
            </div>
          )}

          <div className="course-explorer__panel-bottom">
            <span>Learn at your pace, wherever you are.</span>
            <Link to="/courses" className="course-explorer__all-link">
              Browse all courses <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
