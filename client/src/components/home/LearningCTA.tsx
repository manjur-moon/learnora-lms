import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router";

/**
 * A learning-focused call to action. No newsletter or subscription backend is needed.
 */
export function LearningCTA() {
  return (
    <section className="learning-cta" aria-labelledby="learning-cta-title">
      <div className="learning-cta__shell">
        <div className="learning-cta__card">
          <div className="learning-cta__photo" aria-hidden="true" />
          <div className="learning-cta__overlay" aria-hidden="true" />
          <div className="learning-cta__corner learning-cta__corner--left" aria-hidden="true">01 / YOUR NEXT CHAPTER</div>
          <div className="learning-cta__corner learning-cta__corner--right" aria-hidden="true">LEARN · EXPLORE · GROW</div>

          <div className="learning-cta__content">
            <span className="learning-cta__eyebrow">
              <Sparkles size={13} aria-hidden="true" /> A NEW WAY TO BEGIN
            </span>
            <h2 id="learning-cta-title">
              Your next chapter<br />
              <em>starts with curiosity.</em>
            </h2>
            <p>
              Explore the collection, choose a subject that excites you,
              and discover something worth learning today.
            </p>
            <Link className="learning-cta__button" to="/courses">
              Explore courses
              <span aria-hidden="true"><ArrowUpRight size={18} /></span>
            </Link>
          </div>
        </div>
        <div className="learning-cta__afterword" aria-hidden="true">
          <span>MAKE SPACE FOR NEW IDEAS</span>
          <span className="learning-cta__afterword-line" />
          <span>KEEP LEARNING</span>
        </div>
      </div>
    </section>
  );
}
