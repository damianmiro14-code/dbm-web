import type { Metadata } from "next";
import PageRenderer from "@/components/PageRenderer";
import raw from "@/content/es/servicios.json";
import { validatePageJSON } from "@/lib/pagejson.validate";
import { buildJsonLdFAQ, buildJsonLdLocalBusiness, buildMetadata } from "@/lib/seo";

const page = validatePageJSON(raw);

export const metadata: Metadata = buildMetadata({
  title: page.meta.title,
  description: page.meta.description,
  ogImage: page.meta.ogImage,
  slug: page.meta.slug
});

export default function ServiciosPage() {
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
      <PageRenderer sections={page.sections} />
    </>
  );
}
