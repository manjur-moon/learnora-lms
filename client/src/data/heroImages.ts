/**
 * Decorative hero photographs only. These are not course records.
 * Replace these URLs with licensed local assets in public/images/ when ready.
 */
export type HeroImage = {
  id: string;
  src: string;
  alt: string;
  label: string;
};

export const heroImages: HeroImage[] = [
  {
    id: "teamwork",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=360&h=480&q=85",
    alt: "Students learning together",
    label: "Group Learning",
  },
  {
    id: "study",
    src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=360&h=480&q=85",
    alt: "Focused learning workspace",
    label: "Focused Study",
  },
  {
    id: "collaboration",
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=360&h=480&q=85",
    alt: "Students collaborating on a project",
    label: "Team Projects",
  },
  {
    id: "coding",
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=360&h=480&q=85",
    alt: "People working on laptops",
    label: "Coding Together",
  },
  {
    id: "study-group",
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=360&h=480&q=85",
    alt: "Adult learners collaborating in a group",
    label: "Collaborative Study",
  },
  {
    id: "classroom",
    src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=360&h=480&q=85",
    alt: "Bright learning environment",
    label: "Learning Spaces",
  },
  {
    id: "creativity",
    src: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=360&h=480&q=85",
    alt: "Books and learning materials",
    label: "Creative Learning",
  },
  {
    id: "team-discussion",
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=360&h=480&q=85",
    alt: "Adult learners collaborating in a meeting",
    label: "Team Discussion",
  },
  {
    id: "workspace",
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=360&h=480&q=85",
    alt: "Technology team workspace",
    label: "Tech Workspace",
  },
  {
    id: "notes",
    src: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=360&h=480&q=85",
    alt: "Students discussing ideas",
    label: "Sharing Ideas",
  },
];
