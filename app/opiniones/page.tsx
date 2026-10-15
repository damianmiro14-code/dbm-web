import type { Metadata } from "next";
import PageRenderer from "@/components/PageRenderer";
import Container from "@/components/ui/Container";
import raw from "@/content/es/opiniones.json";
import { validatePageJSON } from "@/lib/pagejson.validate";
import { buildJsonLdFAQ, buildJsonLdLocalBusiness, buildMetadata } from "@/lib/seo";

const page = validatePageJSON(raw);

export const metadata: Metadata = buildMetadata({
  title: page.meta.title,
  description: page.meta.description,
  ogImage: page.meta.ogImage,
  slug: page.meta.slug
});

export default function OpinionesPage() {
  const b = page.business;

  const localBusinessLd = buildJsonLdLocalBusiness({
    name: b?.name ?? "DBM Carpintería Metálica",
    description: page.meta.description,
    urlPath: page.meta.slug,
    telephone: b?.phone,
    email: b?.email,
    address: b?.address
      ? {
          streetAddress: b.address.street,
          addressLocality: b.address.city,
          addressRegion: b.address.region,
          postalCode: b.address.postalCode,
          addressCountry: b.address.country
        }
      : undefined,
    openingHours: b?.openingHours,
    areaServed: b?.areaServed,
    sameAs: [b?.googleProfileUrl, b?.mapsUrl].filter(Boolean) as string[]
  });

  const faqSection = page.sections.find((s) => s.type === "faq");
  const faqLd = faqSection && faqSection.type === "faq" ? buildJsonLdFAQ(faqSection.items) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      {faqLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      ) : null}
      <PageRenderer sections={page.sections.filter((section) => section.type === "hero")} />
      <section className="border-y bg-white py-12">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold">Consulta las reseñas de DBM en Google</h2>
            <p className="mt-4 text-base text-slate-700">
              Puedes consultar directamente las opiniones públicas en nuestra ficha de Google Maps.
              No mostramos aquí testimonios sin una fuente verificable.
            </p>
            <a
              href={b?.mapsUrl ?? "https://maps.app.goo.gl/KFGw1GPm2VWbkhxp8"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Ver reseñas en Google Maps
            </a>
          </div>
        </Container>
      </section>
      <PageRenderer sections={page.sections.filter((section) => section.type !== "hero")} />
    </>
  );
}
