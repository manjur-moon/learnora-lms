import { heroImages } from "../../data/heroImages";

export function HeroImageMarquee() {
  // Three equal groups create a seamless infinite marquee.
  const copies = [0, 1, 2];

  return (
    <div
      className="hero-marquee"
      aria-label="Learning and collaboration photographs"
    >
      <div className="hero-marquee__track">
        {copies.map((copy) => (
          <div
            className="hero-marquee__group"
            key={copy}
            aria-hidden={copy !== 0}
          >
            {heroImages.map((image) => (
              <figure
                className="hero-marquee__item"
                key={`${copy}-${image.id}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading={copy === 0 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                />
                <figcaption className="hero-marquee__caption">
                  <span aria-hidden="true">— </span>{image.label}
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
