import { LOCATION_SLUGS, getLocationLabel } from "@/lib/locationPages";
import { SERVICE_SLUGS } from "@/lib/servicePages";
import { getLocationServicePairs, ServiceSlug } from "@/lib/locationServiceLanding";

export type ServiceLocationLink = {
  locationSlug: (typeof LOCATION_SLUGS)[number];
  locationLabel: string;
  href: string;
};

/**
 * Returns a conservative set of location links where a service is commonly requested.
 *
 * Source of truth: the same recommended (location, service) pairs used for the
 * Service+Locality SEO landings.
 */
function isServiceSlug(value: string): value is ServiceSlug {
  return (SERVICE_SLUGS as readonly string[]).includes(value);
}

export function getTopLocationLinksForService(serviceSlug: ServiceSlug | string, limit = 6): ServiceLocationLink[] {
  const canon = typeof serviceSlug === "string" && isServiceSlug(serviceSlug) ? serviceSlug : null;
  const pairs = canon ? getLocationServicePairs().filter((p) => p.service === canon) : [];

  const links: ServiceLocationLink[] = pairs.map((p) => ({
    locationSlug: p.location,
    locationLabel: getLocationLabel(p.location) ?? p.location,
    href: `/${p.location}/${serviceSlug}`
  }));

  // Defensive fallback: if a service isn't in the recommended pairs, still expose
  // a handful of locality entry points for internal linking.
  if (links.length === 0) {
    return LOCATION_SLUGS.slice(0, limit).map((loc) => ({
      locationSlug: loc,
      locationLabel: getLocationLabel(loc) ?? loc,
      href: `/${loc}/${serviceSlug}`
    }));
  }

  return links.slice(0, limit);
}
