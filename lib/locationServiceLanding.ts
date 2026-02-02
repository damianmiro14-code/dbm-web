import { LOCATION_SLUGS, getTopServiceSlugsForLocation } from "@/lib/locationPages";
import { SERVICE_SLUGS } from "@/lib/servicePages";

export type LocationSlug = (typeof LOCATION_SLUGS)[number];
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

/**
 * Recommended (location, service) combinations for SEO landing pages.
 *
 * Keep it conservative to avoid creating dozens/hundreds of near-duplicate pages.
 * The current policy is: for each location, generate the top 3 services for that area.
 */
export function getLocationServicePairs(): { location: LocationSlug; service: ServiceSlug }[] {
  const pairs: { location: LocationSlug; service: ServiceSlug }[] = [];

  for (const loc of LOCATION_SLUGS) {
    const services = getTopServiceSlugsForLocation(loc).slice(0, 3);
    for (const s of services) pairs.push({ location: loc, service: s });
  }

  // Ensure uniqueness (defensive).
  const seen = new Set<string>();
  return pairs.filter((p) => {
    const key = `${p.location}::${p.service}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
