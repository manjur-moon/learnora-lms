import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, RotateCcw } from "lucide-react";
import { Link } from "react-router";
import { CourseCard } from "../courses/CourseCard";
import type { CoursesResource } from "../../hooks/usePublicCourses";

export function FeaturedCourses({ resource }: { resource: CoursesResource }) {
  const { courses, loadState, errorMessage, reload } = resource;
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const updateButtons = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const maxScroll = Math.max(0, list.scrollWidth - list.clientWidth);
    setCanGoBack(list.scrollLeft > 4);
    setCanGoForward(list.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list || loadState !== "success") return;
    const frame = requestAnimationFrame(updateButtons);
    const observer = new ResizeObserver(updateButtons);
    observer.observe(list);
    // Capture changes to scroll width when the content or viewport changes.
    if (list.firstElementChild) observer.observe(list.firstElementChild);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [courses, loadState, updateButtons]);

  const move = (direction: -1 | 1) => {
    const list = listRef.current;
    if (!list) return;
    const card = list.querySelector<HTMLElement>(".featured-card");
    if (!card) return;
    const gap = parseFloat(window.getComputedStyle(list).columnGap) || 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: reducedMotion ? "instant" : "smooth",
    });
  };

  return (
    <section className="featured-section" id="featured-courses" aria-labelledby="featured-title">
      <div className="featured-section__inner">
        <header className="featured-section__header">
          <div className="featured-section__heading">
            <span className="featured-section__eyebrow"><span aria-hidden="true">✦</span> CURATED FOR CURIOSITY</span>
            <h2 id="featured-title">
              Find Your Next <span>Skill,</span><br />
              <em>Shape What Comes Next.</em>
            </h2>
            <p>Explore meaningful courses, practical lessons, and ideas worth following.</p>
          </div>
          <div className="featured-section__qualities" aria-label="Ways to learn">
            <span>✳ Self-paced</span>
            <span>✳ Video lessons</span>
            <span>✳ Explore freely</span>
          </div>
        </header>

        {loadState === "loading" && (
          <div className="featured-carousel featured-carousel--skeleton" role="status" aria-label="Loading courses">
            {[0, 1, 2].map((value) => (
              <div className="featured-skeleton" key={value} aria-hidden="true">
                <div className="featured-skeleton__image" />
                <div className="featured-skeleton__title" />
                <div className="featured-skeleton__body" />
              </div>
            ))}
            <span className="sr-only">Loading featured courses…</span>
          </div>
        )}

        {loadState === "error" && (
          <div className="featured-status" role="alert">
            <div className="featured-status__icon"><RotateCcw size={23} aria-hidden="true" /></div>
            <h3>Our course shelf is temporarily unavailable.</h3>
            <p>{errorMessage}</p>
            <button type="button" className="featured-status__retry" onClick={reload}>
              <RotateCcw size={15} aria-hidden="true" /> Try again
            </button>
          </div>
        )}

        {loadState === "success" && courses.length === 0 && (
          <div className="featured-status" role="status">
            <div className="featured-status__icon"><BookOpen size={24} aria-hidden="true" /></div>
            <h3>Courses are coming soon.</h3>
            <p>No courses have been published yet. New courses will appear here when an admin creates them.</p>
          </div>
        )}

        {loadState === "success" && courses.length > 0 && (
          <div
            className="featured-carousel"
            ref={listRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured courses"
            tabIndex={0}
            onScroll={updateButtons}
          >
            {courses.map((course, index) => (
              <CourseCard key={course._id} course={course} index={index} total={courses.length} />
            ))}
          </div>
        )}

        <div className="featured-section__footer">
          <Link className="featured-section__button" to="/courses">
            View All Courses <span><ArrowUpRight size={16} aria-hidden="true" /></span>
          </Link>
          <div className="featured-section__navigation" aria-label="Course carousel controls">
            <button type="button" aria-label="Previous courses" disabled={!canGoBack || loadState !== "success"} onClick={() => move(-1)}>
              <ArrowLeft size={18} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Next courses" disabled={!canGoForward || loadState !== "success"} onClick={() => move(1)}>
              <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
