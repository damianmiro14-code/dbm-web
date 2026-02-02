import { LOCATION_SLUGS, getLocationLabel } from "@/lib/locationPages";
import { SERVICE_SLUGS } from "@/lib/servicePages";
import { resolveLocationSlug, resolveServiceSlug } from "@/lib/aliases";

export type LandingContext = {
  locationSlug: (typeof LOCATION_SLUGS)[number];
  locationLabel: string;
  serviceSlug: (typeof SERVICE_SLUGS)[number];
};

/**
 * Detecta si el pathname actual es una landing canónica del tipo:
 *   /{localidad}/{servicio}
 *
 * Importante: NO debe activarse en rutas como /servicios/{slug}.
 * Por eso validamos que el primer segmento sea una localidad conocida.
 */
export function getLandingContextFromPathname(pathname: string | null | undefined): LandingContext | null {
  if (!pathname) return null;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 2) return null;

  // Guardrail: never treat core site routes as "location".
  // This prevents accidental prefill such as "servicios" in /servicios/{slug}.
  // Keep this list conservative and aligned with top-level routes.
  const RESERVED = new Set([
    "servicios",
    "admin",
    "presupuesto",
    "contacto",
    "trabajos",
    "opiniones",
    "preguntas",
    "preguntas-frecuentes",
    "zonas",
    "sitemap.xml",
    "robots.txt"
  ]);
  if (RESERVED.has(parts[0])) return null;

  const loc = resolveLocationSlug(parts[0]).slug;
  const svc = resolveServiceSlug(parts[1]).slug;

  const isKnownLocation = (LOCATION_SLUGS as readonly string[]).includes(loc);
  const isKnownService = (SERVICE_SLUGS as readonly string[]).includes(svc);
  if (!isKnownLocation || !isKnownService) return null;

  const locationSlug = loc as (typeof LOCATION_SLUGS)[number];
  const serviceSlug = svc as (typeof SERVICE_SLUGS)[number];
  const locationLabel = getLocationLabel(locationSlug) ?? locationSlug;

  return { locationSlug, locationLabel, serviceSlug };
}
