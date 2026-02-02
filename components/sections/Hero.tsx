import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ImageGridLightbox from "@/components/ui/ImageGridLightbox";
import type { HeroSection } from "@/lib/pagejson.types";
import { pickWorkImages } from "@/lib/workImages";

export default function Hero({ section }: { section: HeroSection }) {
  return (
    <section id={section.id} aria-label="Hero" className="bg-white">
      <Container>
        <div className="py-16 md:py-24">
          <p className="text-sm uppercase tracking-wide text-brand/80">DBM Carpintería Metálica</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
            {section.headline}
          </h1>
          {section.subheadline ? (
            <p className="mt-5 max-w-3xl text-lg text-slate-700/90">{section.subheadline}</p>
          ) : null}

          {section.inlineGallery ? (
            <div className="mt-8">
              <ImageGridLightbox
                images={(() => {
                  const srcs =
                    section.inlineGallery?.images ??
                    pickWorkImages(section.inlineGallery?.seed ?? "trabajos-hero", section.inlineGallery?.count ?? 9);
                  return srcs.map((src, idx) => ({
                    src,
                    alt: `${section.inlineGallery?.altPrefix ?? "Trabajo"} (foto ${idx + 1})`,
                  }));
                })()}
              />
            </div>
          ) : null}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button className="w-full sm:w-auto" href={section.primaryCta.href}>{section.primaryCta.label}</Button>
            {section.secondaryCta ? (
              <Button className="w-full sm:w-auto" variant="secondary" href={section.secondaryCta.href}>
                {section.secondaryCta.label}
              </Button>
            ) : null}
          </div>

          {section.highlights?.length ? (
            <ul className="mt-10 grid gap-3 md:grid-cols-2 max-w-3xl" aria-label="Puntos clave">
              {section.highlights.map((h) => (
                <li key={h} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                  <span className="font-medium">{h}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
