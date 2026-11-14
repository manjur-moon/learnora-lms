import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { Navbar } from "../layout/Navbar";
import { HeroImageMarquee } from "./HeroImageMarquee";

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__photo" aria-hidden="true" />
      <div className="hero__shade" aria-hidden="true" />
      <Navbar />

      <div className="hero-shell hero__content">
        <h1 id="hero-title" className="hero__heading">
          Where Curiosity
          <span>Becomes Capability</span>
        </h1>
        <p className="hero__description">
          A welcoming space to explore new skills, discover meaningful courses,
          and learn at your own pace.
        </p>
        <Link className="hero__button" to="/courses">
          Explore Courses
          <span className="hero__button-icon">
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </Link>
      </div>

      <HeroImageMarquee />
    </section>
  );
}
