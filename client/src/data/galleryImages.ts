/**
 * Editorial imagery used only for the decorative homepage gallery.
 * These are illustrative photographs, not enrolled students, instructors,
 * course records, reviews, or claims about outcomes.
 *
 * Before launching commercially, replace external image URLs with
 * appropriately licensed, locally optimized assets.
 */
export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  label: string;
  eyebrow: string;
  position?: string;
};

export const galleryImages: GalleryImage[] = [
  {
    id: "collaboration",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=85",
    alt: "Students working together at a shared table",
    label: "Ideas grow together",
    eyebrow: "COLLABORATE",
    position: "center 48%",
  },
  {
    id: "study",
    src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=85",
    alt: "Study materials and hands-on notes on a desk",
    label: "Make room to focus",
    eyebrow: "FOCUS",
    position: "center 56%",
  },
  {
    id: "build",
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=85",
    alt: "Computer screen and work desk used for software development",
    label: "Learn by building",
    eyebrow: "CREATE",
    position: "center center",
  },
  {
    id: "conversation",
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85",
    alt: "A small group discussing ideas around a work table",
    label: "Share your perspective",
    eyebrow: "CONNECT",
    position: "center center",
  },
  {
    id: "tools",
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1300&q=85",
    alt: "Laptops and work tools arranged for a collaborative project",
    label: "Practice with purpose",
    eyebrow: "PRACTICE",
    position: "center 56%",
  },
  {
    id: "curiosity",
    src: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1100&q=85",
    alt: "Open books and learning materials in a calm environment",
    label: "Keep asking questions",
    eyebrow: "DISCOVER",
    position: "center center",
  },
];
