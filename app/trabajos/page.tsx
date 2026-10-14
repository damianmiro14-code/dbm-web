import type { Metadata } from "next";
import WorksV2Client from "@/components/WorksV2Client";
import raw from "@/content/es/trabajos.json";
import site from "@/content/es/site.json";
import { validatePageJSON } from "@/lib/pagejson.validate";
import { buildJsonLdFAQ, buildJsonLdLocalBusiness, buildMetadata } from "@/lib/seo";

const page = validatePageJSON(raw);

const FAQ = [
  {
    question: "¿Podéis desplazaros a obra?",
    answer: "Sí. Hacemos montaje en obra y trabajos en taller según el tipo de proyecto y accesibilidad."
  },
  {
    question: "¿Qué necesitáis para presupuestar?",
    answer: "Con fotos, medidas aproximadas y una breve descripción podemos orientarte. Si hace falta, concertamos visita."
  }
];

export const metadata: Metadata = buildMetadata({
  title: page.meta.title,
  description: page.meta.description,
  ogImage: page.meta.ogImage,
  slug: page.meta.slug
});

export default function TrabajosPage() {
  const b = site.business;
  const localBusinessLd = buildJsonLdLocalBusiness({
    name: b.name,
    description: page.meta.description,
    urlPath: page.meta.slug,
    telephone: b.phone,
    email: b.email,
    address: {
      streetAddress: b.address.street,
      addressLocality: b.address.city,
      addressRegion: b.address.region,
      postalCode: b.address.postalCode,
      addressCountry: b.address.country
    },
    openingHours: b.openingHours,
    areaServed: b.areaServed,
    sameAs: [b.googleProfileUrl, b.mapsUrl].filter(Boolean)
  });
  const faqLd = buildJsonLdFAQ(FAQ.map(item => ({ q: item.question, a: item.answer })));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <WorksV2Client faqs={FAQ} />
    </>
  );
}
