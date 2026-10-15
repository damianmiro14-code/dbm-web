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
  buildMetadata
} from "@/lib/seo";
import {
  LOCATION_SLUGS,
  getLocationLabel,
  getLocationRaw,
  getNearbyLocationSlugs,
  getTopServiceSlugsForLocation
} from "@/lib/locationPages";
import { resolveLocationSlug } from "@/lib/aliases";
import { getServiceLabel } from "@/lib/servicePages";

type Params = { slug: string };
type Props = { params: Promise<Params> };

export function generateStaticParams(): Params[] {
  return LOCATION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canon = resolveLocationSlug(slug).slug;
  const raw = getLocationRaw(canon);
  if (!raw) return {};
  try {
    const page = validatePageJSON(raw);
    return buildMetadata({
      title: page.meta.title,
      description: page.meta.description,
      ogImage: page.meta.ogImage,
      slug: `/zonas/${canon}`
    });
  } catch {
    return {};
  }
}

export default async function ZonaPage({ params }: Props) {
  const { slug } = await params;
  const res = resolveLocationSlug(slug);
  if (res.redirected) redirect(`/zonas/${res.slug}`);
  const canon = res.slug;
  const raw = getLocationRaw(canon);
  if (!raw) notFound();

  let page: ReturnType<typeof validatePageJSON>;
  try {
    page = validatePageJSON(raw);
  } catch {
    notFound();
  }

  const b = page.business;

  const localBusinessLd = buildJsonLdLocalBusiness({
    name: b?.name ?? "DBM Carpintería Metálica",
    description: page.meta.description,
    urlPath: `/zonas/${canon}`,
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

  // Use canonical slug for labels/links to avoid inconsistencies when aliases are used.
  const label = getLocationLabel(canon) ?? page.meta.title;

  const breadcrumbLd = buildJsonLdBreadcrumbList([
    { name: "Inicio", urlPath: "/" },
    { name: "Zonas", urlPath: "/zonas" },
    { name: label, urlPath: `/zonas/${canon}` }
  ]);

  const nearbySlugs = getNearbyLocationSlugs(canon);
  const nearby = nearbySlugs
    .map((s) => ({
      slug: s,
      label: getLocationLabel(s) ?? s,
      href: `/zonas/${s}`
    }))
    .filter((x) => x.slug !== canon)
    .slice(0, 6);

  const topServices = getTopServiceSlugsForLocation(canon)
    .map((s) => ({
      slug: s,
      label: getServiceLabel(s) ?? s,
      // Link to the SEO landing (service + location) to capture long-tail intent.
      href: `/${canon}/${s}`
    }))
    .slice(0, 3);

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
                  href="/zonas"
                  className="opacity-80 hover:opacity-100 transition-opacity duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md"
                >
                  Zonas
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

      {/* Top services for this location */}
      {topServices.length ? (
        <div className="border-b bg-white/70">
          <Container>
            <div className="py-5">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                Servicios más demandados en {label}
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {topServices.map((s) => (
                  <Link
                    key={s.slug}
                    href={s.href}
                    className="rounded-2xl border bg-white p-4 opacity-95 hover:opacity-100 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150 ease-out active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  >
                    <p className="font-semibold">{s.label}</p>
                    <p className="mt-1 text-sm opacity-70">Ver detalles y pedir presupuesto</p>
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </div>
      ) : null}

      {/* Nearby locations */}
      {nearby.length ? (
        <div className="border-b bg-white/70">
          <Container>
            <div className="py-4">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Municipios cercanos</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {nearby.map((n) => (
                  <Link
                    key={n.slug}
                    href={n.href}
                    className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm opacity-90 hover:opacity-100 hover:shadow-sm hover:-translate-y-[1px] transition-all duration-150 ease-out active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  >
                    {n.label}
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </div>
      ) : null}

      <PageRenderer sections={page.sections} />
    </>
  );
}
