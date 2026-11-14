import { useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, ChevronRight, CirclePlay,
  Clock3, GraduationCap, ListVideo, Play, RotateCcw, Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { Navbar } from "../components/layout/Navbar";
import { SiteFooter } from "../components/layout/SiteFooter";
import { LectureVideoPlayer } from "../components/lectures/LectureVideoPlayer";
import { useCourseDetails } from "../hooks/useCourseDetails";
import type { Course } from "../types/course";

const money = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 });

function CourseCover({ course }: { course: Course }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="detail-hero__cover-fallback" aria-hidden="true" />;
  return (
    <img
      className="detail-hero__cover"
      src={course.thumbnailUrl}
      alt=""
      onError={() => setFailed(true)}
    />
  );
}

function DetailState({ title, message, retry }: { title: string; message: string; retry?: () => void }) {
  return (
    <div className="detail-state" role={retry ? "alert" : "status"}>
      <div className="detail-state__icon"><BookOpen size={27} aria-hidden="true" /></div>
      <h1>{title}</h1>
      <p>{message}</p>
      <div className="detail-state__actions">
        {retry && (
          <button type="button" onClick={retry}>
            <RotateCcw size={16} aria-hidden="true" /> Try again
          </button>
        )}
        <Link to="/courses"><ArrowLeft size={16} aria-hidden="true" /> All courses</Link>
      </div>
    </div>
  );
}

export function CourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, lectures, status, errorMessage, reload } = useCourseDetails(courseId);
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const playerRef = useRef<HTMLElement | null>(null);

  const selectedLecture = lectures.find((lecture) => lecture._id === selectedLectureId) ?? lectures[0] ?? null;
  const currentIndex = selectedLecture ? lectures.findIndex((lecture) => lecture._id === selectedLecture._id) : -1;
  const followingLecture = currentIndex >= 0 ? lectures[currentIndex + 1] : null;

  function chooseLecture(id: string) {
    setSelectedLectureId(id);
    if (window.matchMedia("(max-width: 960px)").matches) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      playerRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }
  }

  const price = course?.price === 0 ? "Free" : `৳ ${money.format(course?.price ?? 0)}`;

  return (
    <div className="detail-page">
      <section className="detail-hero" aria-labelledby={course ? "detail-course-title" : undefined}>
        {course && <CourseCover key={course._id} course={course} />}
        <div className="detail-hero__overlay" aria-hidden="true" />
        <Navbar />
        <div className="detail-hero__body">
          <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" />
            <Link to="/courses">Courses</Link><ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">Course details</span>
          </nav>
          {status === "success" && course ? (
            <>
              <span className="detail-hero__eyebrow"><Sparkles size={13} aria-hidden="true" /> THE LEARNING COLLECTION</span>
              <h1 id="detail-course-title">{course.title}</h1>
              <p className="detail-hero__summary">{course.description}</p>
              <div className="detail-hero__meta">
                <span><GraduationCap size={16} aria-hidden="true" /> Self-paced</span>
                <span><ListVideo size={16} aria-hidden="true" /> {lectures.length} {lectures.length === 1 ? "lecture" : "lectures"}</span>
                <span className="detail-hero__price">{price}</span>
              </div>
              <a href="#watch-course" className="detail-hero__cta">
                Explore the lessons <span><ArrowRight size={17} aria-hidden="true" /></span>
              </a>
            </>
          ) : (
            <>
              <span className="detail-hero__eyebrow"><Sparkles size={13} aria-hidden="true" /> THE LEARNING COLLECTION</span>
              <h1>{status === "loading" ? "A new chapter awaits." : "Let's find your course."}</h1>
              <p className="detail-hero__summary">Explore meaningful learning, one lesson at a time.</p>
            </>
          )}
        </div>
        <span className="detail-hero__corner" aria-hidden="true">LEARNORA / COURSES</span>
      </section>

      <main id="watch-course" className="detail-main">
        {status === "loading" && (
          <div className="detail-loading" role="status" aria-label="Loading course and lectures">
            <div className="detail-loading__heading" />
            <div className="detail-loading__columns"><div /><div /></div>
            <span className="sr-only">Loading the course and lectures…</span>
          </div>
        )}

        {status === "not-found" && <DetailState title="Course not found" message={errorMessage} />}
        {status === "error" && <DetailState title="We couldn't load this course" message={errorMessage} retry={reload} />}

        {status === "success" && course && (
          <div className="detail-main__container">
            <header className="detail-intro">
              <div>
                <span className="detail-eyebrow">✳ &nbsp; YOUR LEARNING SPACE</span>
                <h2>Press play. <em>Make progress.</em></h2>
                <p>Choose a lesson and settle in. There is no enrollment or account required to watch.</p>
              </div>
              <span className="detail-intro__note"><CirclePlay size={18} aria-hidden="true" /> Learn at your own pace</span>
            </header>

            <div className="detail-layout">
              <section ref={playerRef} className="detail-watch" aria-labelledby="detail-watch-title">
                <div className="detail-watch__heading">
                  <span className="detail-watch__eyebrow">THE CLASSROOM</span>
                  <h2 id="detail-watch-title">Now <em>watching.</em></h2>
                </div>
                <div className="detail-player">
                  <LectureVideoPlayer lecture={selectedLecture} />
                </div>
                {selectedLecture && (
                  <div className="detail-now" aria-live="polite" aria-atomic="true">
                    <div>
                      <span>LESSON {String(currentIndex + 1).padStart(2, "0")} OF {String(lectures.length).padStart(2, "0")}</span>
                      <h3>{selectedLecture.title}</h3>
                      <p>{selectedLecture.description}</p>
                    </div>
                    {followingLecture && (
                      <button
                        type="button"
                        className="detail-next"
                        onClick={() => chooseLecture(followingLecture._id)}
                        aria-label={`Play next lesson: ${followingLecture.title}`}
                      >
                        Next lesson <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}
                <div className="detail-watch__footnote"><Clock3 size={15} aria-hidden="true" /> Video availability depends on the original hosting provider.</div>
              </section>

              <aside className="detail-curriculum" aria-labelledby="detail-curriculum-title">
                <div className="detail-curriculum__top">
                  <span className="detail-eyebrow">✳ &nbsp; COURSE CONTENT</span>
                  <h2 id="detail-curriculum-title">Your <em>lessons.</em></h2>
                  <p>Select a lecture below to start watching.</p>
                  <span className="detail-curriculum__count">{lectures.length} {lectures.length === 1 ? "LESSON" : "LESSONS"}</span>
                </div>
                {lectures.length === 0 ? (
                  <div className="detail-curriculum__empty" role="status">
                    <BookOpen size={28} aria-hidden="true" />
                    <p>No lectures have been published for this course yet.</p>
                  </div>
                ) : (
                  <ol className="detail-lecture-list" aria-label="Course lectures">
                    {lectures.map((lecture, index) => {
                      const selected = lecture._id === selectedLecture?._id;
                      return (
                        <li key={lecture._id}>
                          <button
                            type="button"
                            className={`detail-lecture${selected ? " detail-lecture--active" : ""}`}
                            aria-pressed={selected}
                            onClick={() => chooseLecture(lecture._id)}
                          >
                            <span className="detail-lecture__number">{String(index + 1).padStart(2, "0")}</span>
                            <span className="detail-lecture__copy">
                              <strong>{lecture.title}</strong>
                              <small>{lecture.description}</small>
                            </span>
                            <span className="detail-lecture__play" aria-hidden="true"><Play size={14} fill="currentColor" /></span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                )}
                <div className="detail-curriculum__footer"><BookOpen size={18} aria-hidden="true" /> Every lesson is available without signing up.</div>
              </aside>
            </div>
            <div className="detail-back"><Link to="/courses"><ArrowLeft size={17} aria-hidden="true" /> Browse more courses</Link></div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
