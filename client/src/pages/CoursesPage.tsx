import { ArrowDown, ArrowUpRight, BookOpen, RotateCcw, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { CourseCatalogItem } from "../components/courses/CourseCatalogItem";
import { Navbar } from "../components/layout/Navbar";
import { SiteFooter } from "../components/layout/SiteFooter";
import { usePublicCourses } from "../hooks/usePublicCourses";

export function CoursesPage() {
  const { courses, loadState, errorMessage, reload } = usePublicCourses();

  return (
    <div className="catalog-page">
      <section className="catalog-hero" aria-labelledby="catalog-hero-title">
        <div className="catalog-hero__shade" aria-hidden="true" />
        <Navbar />
        <div className="catalog-hero__content">
          <span className="catalog-hero__eyebrow"><Sparkles size={13} aria-hidden="true" /> THE LEARNING EDITION</span>
          <h1 id="catalog-hero-title">
            Learn something<br />
            <em>extraordinary.</em>
          </h1>
          <p>Curious minds start here. Discover courses designed to turn ideas into useful, lasting skills.</p>
          <a className="catalog-hero__scroll" href="#course-collection">
            Explore the collection <span><ArrowDown size={17} aria-hidden="true" /></span>
          </a>
        </div>
        <span className="catalog-hero__edition" aria-hidden="true">A NEW CHAPTER IN LEARNING · 01</span>
      </section>

      <main id="course-collection" className="catalog-main">
        <div className="catalog-main__shell">
          <aside className="catalog-aside" aria-label="Course collection information">
            <span className="catalog-aside__eyebrow">✳ &nbsp; THE COURSE LIBRARY</span>
            <h2>Make room<br />for <em>growth.</em></h2>
            <p>Explore every available course and find the one that sparks your next idea.</p>

            <div className="catalog-aside__count" aria-live="polite">
              <strong>{loadState === "success" ? String(courses.length).padStart(2, "0") : "—"}</strong>
              <span>COURSES AVAILABLE</span>
            </div>
            <div className="catalog-aside__note">
              <BookOpen size={22} strokeWidth={1.5} aria-hidden="true" />
              <p>Browse freely. Choose a course to explore its lectures.</p>
            </div>
          </aside>

          <section className="catalog-collection" aria-labelledby="catalog-collection-title">
            <header className="catalog-collection__heading">
              <div>
                <span className="catalog-collection__eyebrow">EXPLORE OUR COURSES</span>
                <h2 id="catalog-collection-title">Find your next <em>inspiration.</em></h2>
              </div>
              {loadState === "success" && (
                <span className="catalog-collection__total" aria-label={`${courses.length} courses found`}>
                  {courses.length} {courses.length === 1 ? "course" : "courses"}
                </span>
              )}
            </header>

            {loadState === "loading" && (
              <div className="catalog-list" role="status" aria-label="Loading courses">
                {[0, 1, 2].map((number) => (
                  <div className="catalog-skeleton" key={number} aria-hidden="true">
                    <div className="catalog-skeleton__image" />
                    <div className="catalog-skeleton__copy"><span /><span /><span /></div>
                  </div>
                ))}
                <span className="sr-only">Loading course collection…</span>
              </div>
            )}

            {loadState === "error" && (
              <div className="catalog-state" role="alert">
                <div className="catalog-state__icon"><RotateCcw size={25} aria-hidden="true" /></div>
                <h3>Our course shelf is unavailable.</h3>
                <p>{errorMessage}</p>
                <button type="button" onClick={reload}><RotateCcw size={16} aria-hidden="true" /> Try again</button>
              </div>
            )}

            {loadState === "success" && courses.length === 0 && (
              <div className="catalog-state" role="status">
                <div className="catalog-state__icon"><BookOpen size={26} aria-hidden="true" /></div>
                <h3>Courses are coming soon.</h3>
                <p>When the administrator adds the first course, it will appear in this collection.</p>
                <Link to="/">Back to homepage <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            )}

            {loadState === "success" && courses.length > 0 && (
              <div className="catalog-list">
                {courses.map((course, index) => (
                  <CourseCatalogItem key={course._id} course={course} index={index} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
