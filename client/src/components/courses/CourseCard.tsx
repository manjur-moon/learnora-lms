import { useState } from "react";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Link } from "react-router";
import type { Course } from "../../types/course";

const priceFormatter = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
});

type Props = {
  course: Course;
  index: number;
  total: number;
};

export function CourseCard({ course, index, total }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const number = String(index + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");

  return (
    <article className="featured-card">
      <Link
        className="featured-card__link"
        to={`/courses/${course._id}`}
        aria-label={`View ${course.title} course details`}
      >
        <div className="featured-card__visual">
          {imageFailed ? (
            <div className="featured-card__image-fallback" role="img" aria-label="Course thumbnail unavailable">
              <BookOpen size={34} strokeWidth={1.2} aria-hidden="true" />
              <span>Discover something new</span>
            </div>
          ) : (
            <img
              className="featured-card__image"
              src={course.thumbnailUrl}
              alt={`${course.title} course thumbnail`}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          )}
          <div className="featured-card__image-shade" aria-hidden="true" />
          <span className="featured-card__corner" aria-hidden="true">
            <ArrowUpRight size={17} strokeWidth={1.7} />
          </span>
          <div className="featured-card__badges">
            <span className="featured-card__counter" aria-label={`Course ${index + 1} of ${total}`}>
              <span className="featured-card__dot" aria-hidden="true" />
              {number} / {totalLabel}
            </span>
            <span className="featured-card__price">
              {course.price === 0 ? "Free" : `৳ ${priceFormatter.format(course.price)}`}
            </span>
          </div>
        </div>
        <div className="featured-card__text">
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <span className="featured-card__explore">
            Explore course <ArrowUpRight size={13} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}
