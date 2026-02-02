export type Address = {
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

export type Business = {
  name: string;
  phone: string;
  email: string;
  address: Address;
  areaServed: string;
  openingHours: string[];
  socialLinks?: { platform: "instagram" | "tiktok" | "facebook" | string; label: string; href: string }[];
  googleProfileUrl?: string;
  mapsUrl?: string;
};

export type PageMeta = {
  locale: string;
  slug: string;
  title: string;
  description: string;
  ogImage?: string;
};

export type HeroSection = {
  type: "hero";
  id: string;
  headline: string;
  subheadline?: string;
  /** Optional inline gallery shown inside the hero (e.g., on /trabajos) */
  inlineGallery?: {
    /** Explicit curated images (recommended) */
    images?: string[];
    /** Deterministic seed used to pick images from /public/images/work (fallback) */
    seed?: string;
    /** Number of images to show (recommended 9 or 12) */
    count?: number;
    /** Prefix for generated alt text */
    altPrefix?: string;
  };
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  highlights?: string[];
};

export type ServicesSection = {
  type: "services";
  id: string;
  title: string;
  subtitle?: string;
  items: { title: string; description: string; tags?: string[]; href?: string }[];
};

export type ProcessSection = {
  type: "process";
  id: string;
  title: string;
  steps: { title: string; description: string }[];
};

export type GallerySection = {
  type: "gallery";
  id: string;
  title: string;
  images: { src: string; alt: string }[];
};

export type TestimonialsSection = {
  type: "testimonials";
  id: string;
  title: string;
  items: { name: string; quote: string }[];
};

export type FAQSection = {
  type: "faq";
  id: string;
  title: string;
  items: { q: string; a: string }[];
};

export type ContactSection = {
  type: "contact";
  id: string;
  title: string;
  subtitle?: string;
  whatsapp?: { phoneE164: string; defaultMessage: string };
  socialLinks?: { platform: "instagram" | "tiktok" | "facebook" | string; label: string; href: string }[];
  fields: {
    nameLabel: string;
    phoneLabel: string;
    emailLabel: string;
    messageLabel: string;
    consentLabel: string;
  };
  submitLabel: string;
};

export type PageSection =
  | HeroSection
  | ServicesSection
  | ProcessSection
  | GallerySection
  | TestimonialsSection
  | FAQSection
  | ContactSection;

export type PageJSON = {
  meta: PageMeta;
  business?: Business;
  sections: PageSection[];
};