import puertaCorrederaObra from "@/content/es/works/puerta-corredera-obra.json";
import barandillaInoxTerraza from "@/content/es/works/barandilla-inox-terraza.json";
import cerramientoPanelSandwichNave from "@/content/es/works/cerramiento-panel-sandwich-nave.json";
import estructuraMetalicaAltillo from "@/content/es/works/estructura-metalica-altillo.json";
import rejasSeguridadVivienda from "@/content/es/works/rejas-seguridad-vivienda.json";
import escaleraMetalicaInterior from "@/content/es/works/escalera-metalica-interior.json";
import vallaOpacaObraMovil from "@/content/es/works/valla-opaca-obra-movil.json";
import refuerzoCerraduraPuerta from "@/content/es/works/refuerzo-cerradura-puerta.json";
import techoPorcheMetalico from "@/content/es/works/techo-porche-metalico.json";

import { LOCATION_SLUGS } from "@/lib/locationPages";
import { SERVICE_SLUGS } from "@/lib/servicePages";
import { injectWorkGallery } from "@/lib/galleryInject";

export const WORK_SLUGS = [
  "puerta-corredera-obra",
  "barandilla-inox-terraza",
  "cerramiento-panel-sandwich-nave",
  "estructura-metalica-altillo",
  "rejas-seguridad-vivienda",
  "escalera-metalica-interior",
  "valla-opaca-obra-movil",
  "refuerzo-cerradura-puerta",
  "techo-porche-metalico"
] as const;

export type WorkSlug = (typeof WORK_SLUGS)[number];
export type LocationSlug = (typeof LOCATION_SLUGS)[number];
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const WORK_LABELS: Record<WorkSlug, string> = {
  "puerta-corredera-obra": "Puerta corredera metálica (obra)",
  "barandilla-inox-terraza": "Barandilla inox para terraza",
  "cerramiento-panel-sandwich-nave": "Cerramiento con panel sándwich (nave)",
  "estructura-metalica-altillo": "Estructura metálica para altillo",
  "rejas-seguridad-vivienda": "Rejas de seguridad para vivienda",
  "escalera-metalica-interior": "Escalera metálica interior",
  "valla-opaca-obra-movil": "Valla opaca móvil para obra",
  "refuerzo-cerradura-puerta": "Refuerzo de cerradura en puerta metálica",
  "techo-porche-metalico": "Techo metálico para porche"
};

export function getWorkLabel(slug: string): string | null {
  if (slug in WORK_LABELS) return WORK_LABELS[slug as WorkSlug];
  return null;
}

type WorkMeta = {
  locationSlug: LocationSlug;
  serviceSlugs: ServiceSlug[];
};

/**
 * Lightweight "source of truth" for relating each case study to:
 * - a location page (/zonas/[slug])
 * - 2-3 relevant services (/servicios/[slug])
 *
 * This is what powers cross-linking: Zonas -> Trabajos and Trabajos -> Zonas/Servicios.
 */
export const WORK_META: Record<WorkSlug, WorkMeta> = {
  "puerta-corredera-obra": {
    locationSlug: "castello-de-la-plana",
    serviceSlugs: ["puertas-rejas-cerramientos", "soldadura"]
  },
  "barandilla-inox-terraza": {
    locationSlug: "benicassim",
    serviceSlugs: ["inox", "soldadura"]
  },
  "cerramiento-panel-sandwich-nave": {
    locationSlug: "onda",
    serviceSlugs: ["panel-sandwich", "cerramientos-paramentos-industriales", "montajes-industriales"]
  },
  "estructura-metalica-altillo": {
    locationSlug: "vila-real",
    serviceSlugs: ["estructuras-metalicas", "soldadura"]
  },
  "rejas-seguridad-vivienda": {
    locationSlug: "borriol",
    serviceSlugs: ["puertas-rejas-cerramientos", "soldadura"]
  },
  "escalera-metalica-interior": {
    locationSlug: "vilafames",
    serviceSlugs: ["escaleras-metalicas", "carpinteria-metalica-a-medida"]
  },
  "valla-opaca-obra-movil": {
    locationSlug: "castello-de-la-plana",
    serviceSlugs: ["cerramientos-paramentos-industriales", "soldadura"]
  },
  "refuerzo-cerradura-puerta": {
    locationSlug: "la-vall-duixo",
    serviceSlugs: ["cerraduras-refuerzos", "puertas-rejas-cerramientos"]
  },
  "techo-porche-metalico": {
    locationSlug: "borriol",
    serviceSlugs: ["estructuras-metalicas", "panel-sandwich", "soldadura"]
  }
};

export function getWorkMeta(slug: string): WorkMeta | null {
  if (slug in WORK_META) return WORK_META[slug as WorkSlug];
  return null;
}

export function getWorkSlugsForLocation(locationSlug: string, limit = 3): WorkSlug[] {
  const slugs = WORK_SLUGS.filter((w) => WORK_META[w].locationSlug === locationSlug).slice(0, limit);
  return slugs;
}

export function getWorkSlugsForLocations(locationSlugs: string[], limit = 3): WorkSlug[] {
  const set = new Set(locationSlugs);
  const out: WorkSlug[] = [];
  for (const w of WORK_SLUGS) {
    if (set.has(WORK_META[w].locationSlug)) {
      out.push(w);
      if (out.length >= limit) break;
    }
  }
  return out;
}

const MAP: Record<WorkSlug, unknown> = {
  "puerta-corredera-obra": puertaCorrederaObra,
  "barandilla-inox-terraza": barandillaInoxTerraza,
  "cerramiento-panel-sandwich-nave": cerramientoPanelSandwichNave,
  "estructura-metalica-altillo": estructuraMetalicaAltillo,
  "rejas-seguridad-vivienda": rejasSeguridadVivienda,
  "escalera-metalica-interior": escaleraMetalicaInterior,
  "valla-opaca-obra-movil": vallaOpacaObraMovil,
  "refuerzo-cerradura-puerta": refuerzoCerraduraPuerta,
  "techo-porche-metalico": techoPorcheMetalico
};

export function getWorkRaw(slug: string): unknown | null {
  if (slug in MAP) {
    // Normalize JSON default wrappers: { default: {...} }
    const raw = MAP[slug as keyof typeof MAP] as any;
    const obj = (raw?.default ?? raw) as any;
    const label = getWorkLabel(slug) ?? "Trabajo";
    return injectWorkGallery(obj, `work:${slug}`, label);
  }
  return null;
}