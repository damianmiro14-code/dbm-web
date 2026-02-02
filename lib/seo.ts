import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export function buildMetadata(opts: {
  title: string;
  description: string;
  ogImage?: string;
  slug: string;
}): Metadata {
  const url = new URL(opts.slug, SITE.url).toString();
  const og = opts.ogImage ? new URL(opts.ogImage, SITE.url).toString() : undefined;

  return {
    title: opts.title,
    description: opts.description,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title: opts.title,
      description: opts.description,
      url,
      locale: SITE.locale,
      images: og ? [{ url: og }] : undefined
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: og ? [og] : undefined
    }
  };
}

type LocalBusinessInput = {
  name: string;
  description: string;
  urlPath: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  openingHours?: string[];
  areaServed?: string;
  sameAs?: string[];
};

export function buildJsonLdLocalBusiness(input: LocalBusinessInput) {
  const url = new URL(input.urlPath, SITE.url).toString();

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: input.name,
    url,
    description: input.description,
    telephone: input.telephone,
    email: input.email,
    address: input.address
      ? {
          "@type": "PostalAddress",
          streetAddress: input.address.streetAddress,
          addressLocality: input.address.addressLocality,
          addressRegion: input.address.addressRegion,
          postalCode: input.address.postalCode,
          addressCountry: input.address.addressCountry
        }
      : undefined,
    openingHours: input.openingHours,
    areaServed: input.areaServed,
    sameAs: input.sameAs,
    priceRange: "€€"
  };
}

export function buildJsonLdFAQ(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a
      }
    }))
  };
}

type ServiceInput = {
  name: string;
  description: string;
  urlPath: string;
  providerName?: string;
  areaServed?: string;
};

export function buildJsonLdService(input: ServiceInput) {
  const url = new URL(input.urlPath, SITE.url).toString();
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url,
    provider: input.providerName
      ? {
          "@type": "LocalBusiness",
          name: input.providerName
        }
      : undefined,
    areaServed: input.areaServed
  };
}

export function buildJsonLdBreadcrumbList(items: { name: string; urlPath: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: new URL(it.urlPath, SITE.url).toString()
    }))
  };
}
