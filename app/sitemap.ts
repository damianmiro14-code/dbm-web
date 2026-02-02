import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { SERVICE_SLUGS } from "@/lib/servicePages";
import { LOCATION_SLUGS } from "@/lib/locationPages";
import { WORK_SLUGS } from "@/lib/workPages";
import { getLocationServicePairs } from "@/lib/locationServiceLanding";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    `${SITE.url}/`,
    `${SITE.url}/servicios`,
    `${SITE.url}/zonas`,
    `${SITE.url}/presupuesto`,
    `${SITE.url}/trabajos`,
    `${SITE.url}/opiniones`,
    `${SITE.url}/preguntas-frecuentes`,
    `${SITE.url}/contacto`
  ];

  const serviceRoutes = SERVICE_SLUGS.map((slug) => `${SITE.url}/servicios/${slug}`);
  const locationRoutes = LOCATION_SLUGS.map((slug) => `${SITE.url}/zonas/${slug}`);
  const workRoutes = WORK_SLUGS.map((slug) => `${SITE.url}/trabajos/${slug}`);

  // Only generate *canonical* zone+service landings from the allowlist.
  const landingRoutes = getLocationServicePairs().map((p) => `${SITE.url}/${p.location}/${p.service}`);

  // Defensive de-duplication (helps prevent accidental double-includes when content changes).
  const all = [...staticRoutes, ...serviceRoutes, ...locationRoutes, ...workRoutes, ...landingRoutes];
  const seen = new Set<string>();
  const unique = all.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });

  return unique.map((url) => ({
    url,
    lastModified: now
  }));
}
