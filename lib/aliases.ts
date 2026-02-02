/**
 * Canonical slug helpers.
 *
 * Goal: accept common human slugs (e.g. /borriol/rejas) and redirect to the canonical
 * slugs used by the content JSON system.
 */

export type ResolveResult = { slug: string; redirected: boolean };

function stripDiacritics(s: string): string {
  try {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch {
    return s;
  }
}

function normalizeSlug(input: string): string {
  const decoded = (() => {
    try {
      return decodeURIComponent(input);
    } catch {
      return input;
    }
  })();

  return stripDiacritics(decoded)
    .toLowerCase()
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Location aliases
const LOCATION_ALIASES: Record<string, string> = {
  "castellon": "castello-de-la-plana",
  "castellon-de-la-plana": "castello-de-la-plana",
  "castello": "castello-de-la-plana",
  "vall-duixo": "la-vall-duixo",
  "vallduixo": "la-vall-duixo"
};

// Service aliases
const SERVICE_ALIASES: Record<string, string> = {
  "rejas": "puertas-rejas-cerramientos",
  "puertas": "puertas-rejas-cerramientos",
  "puerta": "puertas-rejas-cerramientos",
  "cerramientos": "puertas-rejas-cerramientos",
  "cerramiento": "puertas-rejas-cerramientos",
  "carpinteria-metalica": "carpinteria-metalica-a-medida",
  "carpinteria": "carpinteria-metalica-a-medida",
  "estructura-metalica": "estructuras-metalicas",
  "estructuras": "estructuras-metalicas",
  "panel": "panel-sandwich",
  "paneles": "panel-sandwich",
  "sandwich": "panel-sandwich",
  "techo": "techos-cubiertas",
  "techos": "techos-cubiertas",
  "cubierta": "techos-cubiertas",
  "cubiertas": "techos-cubiertas",
  "inoxidable": "inox",
  "acero-inox": "inox",
  "escaleras": "escaleras-metalicas",
  "escalera": "escaleras-metalicas",
  "cerraduras": "cerraduras-refuerzos",
  "refuerzos": "cerraduras-refuerzos",
  "montajes": "montajes-industriales",
  "montaje": "montajes-industriales"
};

export function resolveLocationSlug(input: string): ResolveResult {
  const norm = normalizeSlug(input);
  const canonical = LOCATION_ALIASES[norm] ?? norm;
  return { slug: canonical, redirected: canonical !== norm };
}

export function resolveServiceSlug(input: string): ResolveResult {
  const norm = normalizeSlug(input);
  const canonical = SERVICE_ALIASES[norm] ?? norm;
  return { slug: canonical, redirected: canonical !== norm };
}
