import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowUpRight, BookOpenText, Lightbulb, MonitorPlay } from "lucide-react";
import { Link } from "react-router";

const cards = [
  {
    src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=750&h=950&q=85",
    alt: "Notebook and study workspace",
    label: "Find your focus",
    name: "Study with purpose",
  },
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=750&h=950&q=85",
    alt: "Learners working with their laptops",
    label: "Learn by doing",
    name: "Learn together",
  },
  {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=750&h=950&q=85",
    alt: "Students collaborating on a project",
    label: "Build your future",
    name: "Grow your skills",
  },
] as const;

const benefits = [
  {
    number: "01",
    title: "Explore what inspires",
    description: "Find a course that speaks to your interests and goals.",
    icon: BookOpenText,
  },
  {
    number: "02",
    title: "Learn on your terms",
    description: "Watch lessons when and where learning works for you.",
    icon: MonitorPlay,
  },
  {
    number: "03",
    title: "Turn ideas into skills",
    description: "Take the knowledge you gain into real-world projects.",
    icon: Lightbulb,
  },
] as const;

/**
 * Progress follows section position. Scrolling back reverses the fan animation.
 * No third-party animation library is necessary for this section.
 */
export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;

    const update = () => {
      frameId = 0;
      if (media.matches) {
        setProgress(1);
        return;
      }
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      // Begin when the section reaches the lower viewport; complete near center.
      const raw = (viewport * 0.95 - rect.top) / (viewport * 0.68);
      const next = Math.min(1, Math.max(0, raw));
      setProgress((previous) => Math.abs(previous - next) > 0.005 ? next : previous);
    };

    const schedule = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const fanStyle = { "--fan-progress": progress } as CSSProperties;

  return (
    <section className="about-section" id="about" ref={sectionRef} aria-labelledby="about-title">
      <div className="about-section__inner">
        <div className="about-section__intro">
          <span className="about-section__eyebrow"><span aria-hidden="true">✦</span> OUR APPROACH</span>
          <h2 id="about-title" className="about-section__title">
            Your Space to <span>Explore,</span><br />
            <em>Learn &amp; Grow.</em>
          </h2>
          <p className="about-section__lead">
            A thoughtful place to discover new ideas, learn practical skills,
            and turn curiosity into something meaningful.
          </p>
        </div>

        <div className="about-fan" style={fanStyle} aria-label="Three moments of learning">
          {cards.map((card, index) => (
            <figure className={`about-fan__card about-fan__card--${index + 1}`} key={card.label}>
              <img src={card.src} alt={card.alt} loading="lazy" decoding="async" />
              <figcaption className="about-fan__badge">
                <span className="about-fan__badge-dot" aria-hidden="true" />
                {card.label}
              </figcaption>
              <span className="about-fan__caption" aria-hidden="true">{card.name}</span>
            </figure>
          ))}
        </div>

        <div className="about-benefits" aria-label="Why learn with us">
          {benefits.map(({ number, title, description, icon: Icon }) => (
            <div className="about-benefit" key={number}>
              <div className="about-benefit__top">
                <span className="about-benefit__number">{number}</span>
                <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>

        <Link className="about-section__cta" to="/courses">
          Explore Courses
          <span className="about-section__cta-icon"><ArrowUpRight size={15} aria-hidden="true" /></span>
        </Link>
      </div>
    </section>
  );
}
