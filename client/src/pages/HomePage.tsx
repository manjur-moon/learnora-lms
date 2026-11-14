import { HeroSection } from "../components/home/HeroSection";
import { AboutSection } from "../components/home/AboutSection";
import { FeaturedCourses } from "../components/home/FeaturedCourses";
import { CourseExplorer } from "../components/home/CourseExplorer";
import { LearningGallery } from "../components/home/LearningGallery";
import { LearningCTA } from "../components/home/LearningCTA";
import { SiteFooter } from "../components/layout/SiteFooter";
import { usePublicCourses } from "../hooks/usePublicCourses";

export function HomePage() {
  // Both course sections share one API request, with a shared retry action.
  const resource = usePublicCourses();

  return (
    <>
      <HeroSection />
      <AboutSection />
      <FeaturedCourses resource={resource} />
      <CourseExplorer resource={resource} />
      <LearningGallery />
      <LearningCTA />
      <SiteFooter />
    </>
  );
}
