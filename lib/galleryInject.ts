import { pickWorkImages } from "@/lib/workImages";

type GalleryImage = { src: string; alt?: string; caption?: string };

type GallerySection = { type: "gallery"; images: GalleryImage[] };

type AnySection = Record<string, any> & { type?: string };

type HasSections = { sections?: AnySection[] };

function isPlaceholderGallery(images: GalleryImage[]): boolean {
  if (!images || images.length === 0) return false;
  // Treat the default /gallery/1.jpg,/gallery/2.jpg,/gallery/3.jpg as placeholders
  return images.every((img) => typeof img?.src === "string" && img.src.startsWith("/gallery/"));
}

export function injectWorkGallery<T extends object>(raw: T, seed: string, altPrefix: string, count = 12): T {
  // Deep clone (raw comes from JSON imports)
  const obj: any = JSON.parse(JSON.stringify(raw));
  const sections: AnySection[] = Array.isArray((obj as HasSections).sections) ? (obj as HasSections).sections! : [];
  if (!sections.length) return obj as T;

  for (const section of sections) {
    if (section?.type === "gallery" && Array.isArray(section.images)) {
      const imgs: GalleryImage[] = section.images;
      // Auto-expand ONLY when the gallery is still using placeholders.
      // This keeps services galleries intentionally capped (e.g. 3 images) and avoids
      // replacing curated selections with random picks.
      if (isPlaceholderGallery(imgs)) {
        const picked = pickWorkImages(seed, count);
        section.images = picked.map((src, i) => ({
          src,
          alt: `${altPrefix} (foto ${i + 1})`
        }));
      }
    }
  }

  return obj as T;
}
