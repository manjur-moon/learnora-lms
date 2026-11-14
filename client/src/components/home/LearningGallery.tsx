import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowUpRight, Aperture, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { galleryImages } from "../../data/galleryImages";

/**
 * Decorative, responsive learning gallery. Course records are fetched separately.
 */
export function LearningGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      setReveal(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setReveal(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`learning-gallery${reveal ? " learning-gallery--visible" : ""}`}
      id="learning-gallery"
      ref={sectionRef}
      aria-labelledby="learning-gallery-title"
    >
      <div className="learning-gallery__inner">
        <div className="learning-gallery__intro">
          <div className="learning-gallery__heading-group">
            <span className="learning-gallery__eyebrow">
              <Sparkles size={12} aria-hidden="true" /> BEYOND THE SCREEN
            </span>
            <h2 id="learning-gallery-title">
              Little Moments, <em>Big Ideas.</em>
            </h2>
          </div>
          <p>
            Every new skill begins with curiosity. A visual celebration of
            exploring, practicing, and learning together.
          </p>
        </div>

        <div className="learning-gallery__mosaic" role="group" aria-label="Illustrative learning photography">
          {galleryImages.slice(0, 3).map((image, index) => (
            <figure
              className={`learning-gallery__tile learning-gallery__tile--${index + 1}`}
              key={image.id}
              style={{ "--gallery-delay": `${index * 75}ms` } as CSSProperties}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: image.position }}
                onError={(event) => event.currentTarget.classList.add("learning-gallery__image--missing")}
              />
              <figcaption className="learning-gallery__caption">
                <span>{image.eyebrow}</span>
                <strong>{image.label}</strong>
              </figcaption>
            </figure>
          ))}

          <div className="learning-gallery__interlude" aria-label="Learning is a process">
            <Aperture size={22} strokeWidth={1.4} aria-hidden="true" />
            <p>Explore. Practice. <em>Become.</em></p>
          </div>

          {galleryImages.slice(3).map((image, index) => (
            <figure
              className={`learning-gallery__tile learning-gallery__tile--${index + 4}`}
              key={image.id}
              style={{ "--gallery-delay": `${(index + 4) * 75}ms` } as CSSProperties}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: image.position }}
                onError={(event) => event.currentTarget.classList.add("learning-gallery__image--missing")}
              />
              <figcaption className="learning-gallery__caption">
                <span>{image.eyebrow}</span>
                <strong>{image.label}</strong>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="learning-gallery__footer">
          <p>Illustrative photography · A look at the spirit of learning</p>
          <Link to="/courses" className="learning-gallery__cta">
            Explore courses
            <span><ArrowUpRight size={15} aria-hidden="true" /></span>
          </Link>
        </div>
      </div>
    </section>
  );
}
