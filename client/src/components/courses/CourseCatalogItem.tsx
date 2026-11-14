import { useState } from "react";
import { ArrowUpRight, BookOpen, MoveRight } from "lucide-react";
import { Link } from "react-router";
import type { Course } from "../../types/course";

const currency = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
});

type Props = {
  course: Course;
  index: number;
};

/** One real course from the GET /api/courses response. */
export function CourseCatalogItem({ course, index }: Props) {
  const [hasImageError, setHasImageError] = useState(false);
  const price = course.price === 0 ? "Free" : `৳ ${currency.format(course.price)}`;

  return (
    <article className="catalog-item">
      <Link
        className="catalog-item__image-link"
        to={`/courses/${course._id}`}
        aria-label={`View ${course.title}`}
      >
        {hasImageError ? (
          <div className="catalog-item__fallback" role="img" aria-label="Course thumbnail unavailable">
            <BookOpen size={36} strokeWidth={1.3} aria-hidden="true" />
            <span>Keep learning</span>
          </div>
        ) : (
          <img
            src={course.thumbnailUrl}
            alt={`${course.title} thumbnail`}
            loading="lazy"
            decoding="async"
            onError={() => setHasImageError(true)}
          />
        )}
        <span className="catalog-item__image-index" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
      </Link>

      <div className="catalog-item__body">
        <div className="catalog-item__topline">
          <span className="catalog-item__type">SELF-PACED COURSE</span>
          <span className="catalog-item__price" aria-label={`Course price ${price}`}>{price}</span>
        </div>

        <h2><Link to={`/courses/${course._id}`}>{course.title}</Link></h2>
        <p>{course.description}</p>
        <Link className="catalog-item__action" to={`/courses/${course._id}`}>
          View course <MoveRight size={17} aria-hidden="true" />
        </Link>
      </div>
      <span className="catalog-item__corner" aria-hidden="true"><ArrowUpRight size={19} /></span>
    </article>
  );
}
