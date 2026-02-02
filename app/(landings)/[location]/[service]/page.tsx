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
import { getServiceLabel, getServiceRaw } from "@/lib/servicePages";
import { getLocationLabel, getLocationRaw } from "@/lib/locationPages";
import { resolveLocationSlug, resolveServiceSlug } from "@/lib/aliases";
import { getLocationServicePairs } from "@/lib/locationServiceLanding";

type Params = { location: string; service: string };
type Props = { params: Promise<Params> };

function isAllowedPair(location: string, service: string): boolean {
  // Keep landings conservative: only render the recommended (location, service) pairs.
  // Aliases are handled before this check.
  return getLocationServicePairs().some((p) => p.location === location && p.service === service);
}

export function generateStaticParams(): Params[] {
  return getLocationServicePairs().map((p) => ({ location: p.location, service: p.service }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location, service } = await params;

  const loc = resolveLocationSlug(location).slug;
  const svc = resolveServiceSlug(service).slug;

  if (!isAllowedPair(loc, svc)) return {};

  const serviceRaw = getServiceRaw(svc);
  const locationLabel = getLocationLabel(loc);
  if (!serviceRaw || !locationLabel) return {};

  try {
    const servicePage = validatePageJSON(serviceRaw);
    const serviceLabel = getServiceLabel(svc) ?? servicePage.meta.title;

    const title = `${serviceLabel} en ${locationLabel} | DBM`;
    const description = `${serviceLabel} en ${locationLabel}. ${servicePage.meta.description}`.slice(0, 160);

    return buildMetadata({
      title,
      description,
      ogImage: servicePage.meta.ogImage,
      slug: `/${loc}/${svc}`
    });
  } catch {
    return {};
  }
}

export default async function LocationServiceLandingPage({ params }: Props) {
  const { location, service } = await params;

  const locRes = resolveLocationSlug(location);
  const svcRes = resolveServiceSlug(service);
  if (locRes.redirected || svcRes.redirected) {
    redirect(`/${locRes.slug}/${svcRes.slug}`);
  }
  const loc = locRes.slug;
  const svc = svcRes.slug;

  // Safety: only allow the recommended pairs to avoid creating dozens of near-duplicate pages.
  // This still permits aliases because we resolve+redirect before this point.
  if (!isAllowedPair(loc, svc)) return notFound();

  // Only allow conservative pairs. This avoids generating dozens of near-duplicate pages.
  if (!isAllowedPair(loc, svc)) return notFound();

  const serviceRaw = getServiceRaw(svc);
  const locationRaw = getLocationRaw(loc);
  const locationLabel = getLocationLabel(loc);
  if (!serviceRaw || !locationRaw || !locationLabel) return notFound();

  const parsed = (() => {
    try {
      return {
        servicePage: validatePageJSON(serviceRaw),
        locationPage: validatePageJSON(locationRaw)
      };
    } catch {
      return null;
    }
  })();
  if (!parsed) return notFound();

  const { servicePage, locationPage } = parsed;

  const serviceLabel = getServiceLabel(svc) ?? servicePage.meta.title;
  const urlPath = `/${loc}/${svc}`;

  // Build landing sections: start from service page and inject location context.
  const mergedSections = servicePage.sections.map((s) => {
    if (s.type === "hero") {
      return {
        ...s,
        headline: `${serviceLabel} en ${locationLabel}`,
        subheadline:
          (s.subheadline ? `${s.subheadline} ` : "") +
          `Trabajamos en ${locationLabel} y alrededores, con atención directa y presupuesto rápido.`,
        primaryCta: { ...s.primaryCta, href: "#contacto" },
        secondaryCta: { label: `Ver zona ${locationLabel}`, href: `/zonas/${location}` },
        highlights: Array.from(
          new Set([...(s.highlights ?? []), `Servicio en ${locationLabel}`, "Presupuesto rápido"])
        ).slice(0, 4)
      };
    }

    if (s.type === "faq") {
      const serviceFaq = s.items ?? [];
      const locationFaqSection = locationPage.sections.find((x) => x.type === "faq");
      const locationFaq = locationFaqSection && locationFaqSection.type === "faq" ? locationFaqSection.items : [];

      const combined: { q: string; a: string }[] = [];
      const seenQ = new Set<string>();

      const pushUnique = (items: { q: string; a: string }[], limit: number) => {
        for (const it of items) {
          const key = it.q.trim().toLowerCase();
          if (!key || seenQ.has(key)) continue;
          seenQ.add(key);
          combined.push(it);
          if (combined.length >= limit) return;
        }
      };

      // 4 + 4 makes the landing less "duplicate" and more locally relevant.
      pushUnique(serviceFaq, 4);
      pushUnique(locationFaq, 8);

      return {
        ...s,
        title: `Preguntas frecuentes: ${serviceLabel} en ${locationLabel}`,
        items: combined.length ? combined : serviceFaq
      };
    }

    if (s.type === "contact") {
      const original = s.whatsapp?.defaultMessage ?? "";
      const base = original
        ? original
        : `Hola, soy ____ y necesito presupuesto de ${serviceLabel} en ${locationLabel}.`;

      // Normalize message to include the location.
      const message = base.replace(/en\s+Castell[oó]n/gi, `en ${locationLabel}`);

      return {
        ...s,
        title: `Pide presupuesto de ${serviceLabel} en ${locationLabel}`,
        subtitle:
          (s.subtitle ? `${s.subtitle} ` : "") +
          `Indica si es en ${locationLabel} y adjunta medidas/fotos para una respuesta más rápida.`,
        whatsapp: s.whatsapp
          ? {
              ...s.whatsapp,
              defaultMessage: message
            }
          : {
              phoneE164: servicePage.business?.phone ?? "+34624356893",
              defaultMessage: message
            }
      };
    }

    return s;
  });

  const landingPage = validatePageJSON({
    meta: {
      locale: servicePage.meta.locale,
      slug: urlPath,
      title: `${serviceLabel} en ${locationLabel} | DBM`,
      description: `${serviceLabel} en ${locationLabel}. ${servicePage.meta.description}`.slice(0, 180),
      ogImage: servicePage.meta.ogImage
    },
    business: servicePage.business,
    sections: mergedSections
  });

  const b = landingPage.business;

  const localBusinessLd = buildJsonLdLocalBusiness({
    name: b?.name ?? "DBM Carpintería Metálica",
    description: landingPage.meta.description,
    urlPath,
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
    areaServed: `${locationLabel} y alrededores`,
    sameAs: [b?.googleProfileUrl, b?.mapsUrl].filter(Boolean) as string[]
  });

  const serviceLd = buildJsonLdService({
    name: `${serviceLabel} en ${locationLabel}`,
    description: landingPage.meta.description,
    urlPath,
    providerName: b?.name ?? "DBM Carpintería Metálica",
    areaServed: `${locationLabel} y alrededores`
  });

  const faqSection = landingPage.sections.find((s) => s.type === "faq");
  const faqLd = faqSection && faqSection.type === "faq" ? buildJsonLdFAQ(faqSection.items) : null;

  const breadcrumbLd = buildJsonLdBreadcrumbList([
    { name: "Inicio", urlPath: "/" },
    { name: "Zonas", urlPath: "/zonas" },
    { name: locationLabel, urlPath: `/zonas/${location}` },
    { name: serviceLabel, urlPath }
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
                  href="/zonas"
                  className="opacity-80 hover:opacity-100 transition-opacity duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md"
                >
                  Zonas
                </Link>
              </li>
              <li className="opacity-50" aria-hidden>
                /
              </li>
              <li>
                <Link
                  href={`/zonas/${loc}`}
                  className="opacity-80 hover:opacity-100 transition-opacity duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md"
                >
                  {locationLabel}
                </Link>
              </li>
              <li className="opacity-50" aria-hidden>
                /
              </li>
              <li className="font-medium opacity-90">{serviceLabel}</li>
            </ol>
          </nav>

          {/* Context links */}
          <div className="pb-4 flex flex-wrap gap-2">
            <Link
              href={`/servicios/${svc}`}
              className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm opacity-90 hover:opacity-100 hover:shadow-sm hover:-translate-y-[1px] transition-all duration-150 ease-out active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              Ver servicio completo
            </Link>
            <Link
              href={`/zonas/${loc}`}
              className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm opacity-90 hover:opacity-100 hover:shadow-sm hover:-translate-y-[1px] transition-all duration-150 ease-out active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              Ver zona
            </Link>
          </div>
        </Container>
      </div>

      <PageRenderer sections={landingPage.sections} />
    </>
  );
}
