import type { Metadata } from "next";
import raw from "@/content/es/servicios.json";
import { validatePageJSON } from "@/lib/pagejson.validate";
import { buildJsonLdFAQ, buildJsonLdLocalBusiness, buildMetadata } from "@/lib/seo";
import ServicesV2Client from "@/components/ServicesV2Client";

const page = validatePageJSON(raw);
const description = "Carpintería metálica en Castellón y provincia: puertas, cerramientos, estructuras, cubiertas, soldadura, acero inoxidable y montajes industriales a medida.";

const FAQ = [
  {
    question: "¿Trabajáis en toda la provincia de Castellón?",
    answer: "Trabajamos en Castelló de la Plana, Borriol y otras localidades de la provincia. Cuéntanos dónde está el proyecto para valorar el desplazamiento y el montaje."
  },
  {
    question: "¿Qué necesitáis para preparar un presupuesto?",
    answer: "Envíanos la localidad, algunas fotos y medidas aproximadas o un plano, si lo tienes. Si es necesario medir en persona, podemos coordinar una visita."
  },
  {
    question: "¿Hacéis trabajos metálicos a medida?",
    answer: "Sí. Valoramos fabricación, reparación y montaje de soluciones de hierro y acero inoxidable según las necesidades del proyecto."
  },
  {
    question: "¿Puedo visitar vuestra nave?",
    answer: "Atendemos en nave con cita previa. Contacta antes con nosotros para coordinar la visita."
  }
];

export const metadata: Metadata = buildMetadata({
  title: page.meta.title,
  description,
  ogImage: page.meta.ogImage,
  slug: page.meta.slug
});

export default function ServiciosPage() {
  const b = page.business;
  const serviceSection = page.sections.find((section) => section.type === "services");
  const services = serviceSection && serviceSection.type === "services" ? serviceSection.items : [];

  const localBusinessLd = buildJsonLdLocalBusiness({
    name: b?.name ?? "DBM Carpintería Metálica",
    description,
    urlPath: page.meta.slug,
    telephone: b?.phone,
    email: b?.email,
    address: b?.address ? {
      streetAddress: b.address.street,
      addressLocality: b.address.city,
      addressRegion: b.address.region,
      postalCode: b.address.postalCode,
      addressCountry: b.address.country
    } : undefined,
    openingHours: ["L-V 07:00-20:00", "S 08:00-14:00"],
    areaServed: b?.areaServed,
    sameAs: [b?.googleProfileUrl, b?.mapsUrl].filter(Boolean) as string[]
  });

  const faqLd = buildJsonLdFAQ(FAQ.map(item => ({ q: item.question, a: item.answer })));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <ServicesV2Client services={services} faqs={FAQ} />
    </>
  );
}
