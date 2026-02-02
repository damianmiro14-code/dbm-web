import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PageRenderer from "@/components/PageRenderer";
import Container from "@/components/ui/Container";
import { validatePageJSON } from "@/lib/pagejson.validate";
import {
  buildJsonLdBreadcrumbList,
  buildJsonLdFAQ,
  buildJsonLdLocalBusiness,
  buildJsonLdService,
  buildMetadata
} from "@/lib/seo";
import { SERVICE_SLUGS, getServiceLabel, getServiceRaw } from "@/lib/servicePages";
import { resolveServiceSlug } from "@/lib/aliases";
import { getTopLocationLinksForService } from "@/lib/serviceLocationLinks";

type Params = { slug: string };
type Props = { params: Promise<Params> };

export function generateStaticParams(): Params[] {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canon = resolveServiceSlug(slug).slug;
  const raw = getServiceRaw(canon);
  if (!raw) return {};
  try {
    const page = validatePageJSON(raw);
    return buildMetadata({
      title: page.meta.title,
      description: page.meta.description,
      ogImage: page.meta.ogImage,
      slug: `/servicios/${canon}`
    });
  } catch {
    // If the JSON is invalid, avoid crashing metadata generation.
    return {};
  }
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const res = resolveServiceSlug(slug);
  if (res.redirected) redirect(`/servicios/${res.slug}`);
  const canon = res.slug;
  const raw = getServiceRaw(canon);
  if (!raw) notFound();

  let page: ReturnType<typeof validatePageJSON>;
  try {
    page = validatePageJSON(raw);
  } catch {
    // Hard fail-safe: invalid JSON should not bring down the app.
    notFound();
  }
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

  const serviceLd = buildJsonLdService({
    name: page.meta.title,
    description: page.meta.description,
    urlPath: page.meta.slug,
    providerName: b?.name ?? "DBM Carpintería Metálica",
    areaServed: b?.areaServed
  });

  const faqSection = page.sections.find((s) => s.type === "faq");
  const faqLd = faqSection && faqSection.type === "faq" ? buildJsonLdFAQ(faqSection.items) : null;

  // Use canonical slug for labels/links to avoid inconsistencies when aliases are used.
  const serviceLabel = getServiceLabel(canon) ?? page.meta.title;

  const breadcrumbLd = buildJsonLdBreadcrumbList([
    { name: "Inicio", urlPath: "/" },
    { name: "Servicios", urlPath: "/servicios" },
    { name: serviceLabel, urlPath: page.meta.slug }
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      ) : null}

      {/* Breadcrumb */}
      <div className="border-b bg-white/70">
        <Container>
          <nav aria-label="Breadcrumb" className="py-3">
            <ol className="flex flex-wrap items-center gap-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="opacity-80 hover:opacity-100 transition-opacity duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md"
                >
                  Inicio
                </Link>
              </li>
              <li className="opacity-50" aria-hidden>
                /
              </li>
              <li>
                <Link
                  href="/servicios"
                  className="opacity-80 hover:opacity-100 transition-opacity duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md"
                >
                  Servicios
                </Link>
              </li>
              <li className="opacity-50" aria-hidden>
                /
              </li>
              <li className="font-medium opacity-90">{serviceLabel}</li>
            </ol>
          </nav>
        </Container>
      </div>
      <PageRenderer sections={page.sections} />

      {/* Zonas donde más se solicita este servicio */}
      <div className="border-t bg-white/70">
        <Container>
          <section className="py-10">
            <h2 className="text-xl font-semibold">{`Zonas donde más se solicita ${serviceLabel}`}</h2>
            <p className="mt-2 text-sm opacity-80">
              Acceso rápido a información y presupuesto por localidad (SEO local).
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {getTopLocationLinksForService(canon, 6).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group rounded-2xl border bg-white p-4 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                  <div className="text-sm font-semibold">{`${serviceLabel} en ${l.locationLabel}`}</div>
                  <div className="mt-1 text-sm opacity-80">Ver detalles, ejemplos y pedir presupuesto</div>
                </Link>
              ))}
            </div>
          </section>
        </Container>
      </div>
    </>
  );
}
