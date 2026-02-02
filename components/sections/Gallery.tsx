import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import ImageGridLightbox from "@/components/ui/ImageGridLightbox";
import type { GallerySection } from "@/lib/pagejson.types";

export default function Gallery({ section }: { section: GallerySection }) {
  return (
    <section id={section.id} aria-label={section.title}>
      <Container>
        <div className="py-14 md:py-20">
          <SectionHeader title={section.title} />
          <ImageGridLightbox images={section.images} className="mt-8" />
        </div>
      </Container>
    </section>
  );
}
