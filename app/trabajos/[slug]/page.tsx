import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/components/ui/Container";
import PageRenderer from "@/components/PageRenderer";
import { validatePageJSON } from "@/lib/pagejson.validate";
import { buildJsonLdBreadcrumbList, buildJsonLdFAQ, buildJsonLdLocalBusiness, buildMetadata } from "@/lib/seo";
import { getLocationLabel } from "@/lib/locationPages";
import { getServiceLabel } from "@/lib/servicePages";
import { WORK_SLUGS, getWorkLabel, getWorkMeta, getWorkRaw } from "@/lib/workPages";

type Params = { slug: string };
type Props = { params: Promise<Params> };

export function generateStaticParams(): Params[] {
  return WORK_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const raw = getWorkRaw(slug);
  if (!raw) return {};
  try {
    const page = validatePageJSON(raw);
    return buildMetadata({
      title: page.meta.title,
      description: page.meta.description,
      ogImage: page.meta.ogImage,
      slug: page.meta.slug
    });
  } catch {
    return {};
  }
}

export default async function TrabajoDetailPage({ params }: Props) {
  const { slug } = await params;
  const raw = getWorkRaw(slug);
  if (!raw) notFound();

  let page: ReturnType<typeof validatePageJSON>;
  try {
    page = validatePageJSON(raw);
  } catch {
    notFound();
  }

  const b = page.business;
  const label = getWorkLabel(slug) ?? page.meta.title;

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

  const breadcrumbLd = buildJsonLdBreadcrumbList([
    { name: "Inicio", urlPath: "/" },
    { name: "Trabajos", urlPath: "/trabajos" },
    { name: label, urlPath: page.meta.slug }
  ]);

  const faqSection = page.sections.find((s) => s.type === "faq");
  const faqLd = faqSection && faqSection.type === "faq" ? buildJsonLdFAQ(faqSection.items) : null;

  // Cross-linking: Trabajos -> Zonas/Servicios
  const meta = getWorkMeta(slug);
  const location = meta
    ? {
        slug: meta.locationSlug,
        label: getLocationLabel(meta.locationSlug) ?? meta.locationSlug,
        href: `/zonas/${meta.locationSlug}`
      }
    : null;

  const relatedServices = meta
    ? meta.serviceSlugs
        .map((s) => ({
          slug: s,
          label: getServiceLabel(s) ?? s,
          href: `/servicios/${s}`
        }))
        .slice(0, 3)
    : [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
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
                  href="/trabajos"
                  className="opacity-80 hover:opacity-100 transition-opacity duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md"
                >
                  Trabajos
                </Link>
              </li>
              <li className="opacity-50" aria-hidden>
                /
              </li>
              <li className="font-medium opacity-90">{label}</li>
            </ol>
          </nav>
        </Container>
      </div>

      {/* Location + related services */}
      {location || relatedServices.length ? (
        <div className="border-b bg-white/70">
          <Container>
            <div className="py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {location ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Zona</p>
                  <Link
                    href={location.href}
                    className="mt-1 inline-flex items-center rounded-full border px-3 py-1.5 text-sm opacity-90 hover:opacity-100 hover:shadow-sm hover:-translate-y-[1px] transition-all duration-150 ease-out active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  >
                    {location.label}
                  </Link>
                </div>
              ) : null}

              {relatedServices.length ? (
                <div className="md:text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Servicios relacionados</p>
                  <div className="mt-2 flex flex-wrap gap-2 md:justify-end">
                    {relatedServices.map((s) => (
                      <Link
                        key={s.slug}
                        href={s.href}
                        className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm opacity-90 hover:opacity-100 hover:shadow-sm hover:-translate-y-[1px] transition-all duration-150 ease-out active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Container>
        </div>
      ) : null}

      <PageRenderer sections={page.sections} />
    </>
  );
}
