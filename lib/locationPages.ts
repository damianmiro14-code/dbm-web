import castello from "@/content/es/locations/castello-de-la-plana.json";
import borriol from "@/content/es/locations/borriol.json";
import almassora from "@/content/es/locations/almassora.json";
import vilaReal from "@/content/es/locations/vila-real.json";
import benicassim from "@/content/es/locations/benicassim.json";
import borriana from "@/content/es/locations/borriana.json";
import orpesa from "@/content/es/locations/orpesa.json";
import santJoanDeMoro from "@/content/es/locations/sant-joan-de-moro.json";
import vilafames from "@/content/es/locations/vilafames.json";
import laPoblaTornesa from "@/content/es/locations/la-pobla-tornesa.json";
import lAlcora from "@/content/es/locations/l-alcora.json";
import cabanes from "@/content/es/locations/cabanes.json";
import onda from "@/content/es/locations/onda.json";
import nules from "@/content/es/locations/nules.json";
import laVallDuixo from "@/content/es/locations/la-vall-duixo.json";
import provincia from "@/content/es/locations/provincia-castellon.json";

import { SERVICE_SLUGS } from "@/lib/servicePages";
import { injectWorkGallery } from "@/lib/galleryInject";

export const LOCATION_SLUGS = [
  "castello-de-la-plana",
  "borriol",
  "almassora",
  "vila-real",
  "benicassim",
  "borriana",
  "orpesa",
  "sant-joan-de-moro",
  "vilafames",
  "la-pobla-tornesa",
  "l-alcora",
  "cabanes",
  "onda",
  "nules",
  "la-vall-duixo",
  "provincia-castellon"
] as const;

export const LOCATION_LABELS: Record<(typeof LOCATION_SLUGS)[number], string> = {
  "castello-de-la-plana": "Castelló de la Plana",
  borriol: "Borriol",
  almassora: "Almassora",
  "vila-real": "Vila-real",
  benicassim: "Benicàssim",
  borriana: "Borriana",
  orpesa: "Orpesa / Oropesa del Mar",
  "sant-joan-de-moro": "Sant Joan de Moró",
  vilafames: "Vilafamés",
  "la-pobla-tornesa": "La Pobla Tornesa",
  "l-alcora": "L'Alcora",
  cabanes: "Cabanes",
  onda: "Onda",
  nules: "Nules",
  "la-vall-duixo": "La Vall d'Uixó",
  "provincia-castellon": "Provincia de Castellón"
};

/**
 * Nearby locations to reinforce internal linking between area pages.
 * These are "cercanas" in the practical sense (zonas habituales de trabajo),
 * not strict administrative borders.
 */
export const LOCATION_NEARBY: Record<(typeof LOCATION_SLUGS)[number], (typeof LOCATION_SLUGS)[number][]> = {
  "castello-de-la-plana": ["borriol", "almassora", "benicassim", "vila-real", "sant-joan-de-moro"],
  borriol: ["castello-de-la-plana", "sant-joan-de-moro", "vilafames", "la-pobla-tornesa", "l-alcora"],
  almassora: ["castello-de-la-plana", "vila-real", "borriana", "onda", "nules"],
  "vila-real": ["castello-de-la-plana", "almassora", "borriana", "onda", "nules"],
  benicassim: ["castello-de-la-plana", "orpesa", "cabanes", "borriol", "almassora"],
  borriana: ["vila-real", "almassora", "nules", "castello-de-la-plana", "la-vall-duixo"],
  orpesa: ["benicassim", "cabanes", "castello-de-la-plana", "vilafames", "la-pobla-tornesa"],
  "sant-joan-de-moro": ["borriol", "castello-de-la-plana", "vilafames", "l-alcora", "la-pobla-tornesa"],
  vilafames: ["borriol", "sant-joan-de-moro", "la-pobla-tornesa", "cabanes", "castello-de-la-plana"],
  "la-pobla-tornesa": ["borriol", "vilafames", "sant-joan-de-moro", "l-alcora", "cabanes"],
  "l-alcora": ["sant-joan-de-moro", "borriol", "vilafames", "onda", "castello-de-la-plana"],
  cabanes: ["vilafames", "la-pobla-tornesa", "orpesa", "benicassim", "castello-de-la-plana"],
  onda: ["l-alcora", "vila-real", "almassora", "nules", "castello-de-la-plana"],
  nules: ["la-vall-duixo", "borriana", "vila-real", "onda", "castello-de-la-plana"],
  "la-vall-duixo": ["nules", "borriana", "vila-real", "castello-de-la-plana", "almassora"],
  "provincia-castellon": ["castello-de-la-plana", "borriol", "almassora", "vila-real", "benicassim"]
};

/**
 * Top services by location (SEO intent + conversion).
 * Keep it conservative: 3 services that are broadly relevant for that area.
 */
export const LOCATION_TOP_SERVICES: Record<(typeof LOCATION_SLUGS)[number], (typeof SERVICE_SLUGS)[number][]> = {
  "castello-de-la-plana": ["carpinteria-metalica-a-medida", "inox", "soldadura"],
  borriol: ["puertas-rejas-cerramientos", "carpinteria-metalica-a-medida", "soldadura"],
  almassora: ["estructuras-metalicas", "montajes-industriales", "soldadura"],
  "vila-real": ["estructuras-metalicas", "montajes-industriales", "soldadura"],
  benicassim: ["inox", "puertas-rejas-cerramientos", "techos-cubiertas"],
  borriana: ["puertas-rejas-cerramientos", "estructuras-metalicas", "panel-sandwich"],
  orpesa: ["inox", "puertas-rejas-cerramientos", "techos-cubiertas"],
  "sant-joan-de-moro": ["carpinteria-metalica-a-medida", "puertas-rejas-cerramientos", "soldadura"],
  vilafames: ["carpinteria-metalica-a-medida", "puertas-rejas-cerramientos", "soldadura"],
  "la-pobla-tornesa": ["puertas-rejas-cerramientos", "carpinteria-metalica-a-medida", "soldadura"],
  "l-alcora": ["estructuras-metalicas", "puertas-rejas-cerramientos", "soldadura"],
  cabanes: ["puertas-rejas-cerramientos", "panel-sandwich", "estructuras-metalicas"],
  onda: ["estructuras-metalicas", "montajes-industriales", "panel-sandwich"],
  nules: ["puertas-rejas-cerramientos", "estructuras-metalicas", "panel-sandwich"],
  "la-vall-duixo": ["puertas-rejas-cerramientos", "estructuras-metalicas", "inox"],
  "provincia-castellon": ["soldadura", "inox", "estructuras-metalicas"]
};

export function getTopServiceSlugsForLocation(slug: string): (typeof SERVICE_SLUGS)[number][] {
  if (slug in LOCATION_TOP_SERVICES) return LOCATION_TOP_SERVICES[slug as keyof typeof LOCATION_TOP_SERVICES];
  return ["soldadura", "carpinteria-metalica-a-medida", "inox"];
}

export function getNearbyLocationSlugs(slug: string): (typeof LOCATION_SLUGS)[number][] {
  if (slug in LOCATION_NEARBY) return LOCATION_NEARBY[slug as keyof typeof LOCATION_NEARBY];
  return [];
}

export function getLocationLabel(slug: string): string | null {
  if (slug in LOCATION_LABELS) return LOCATION_LABELS[slug as keyof typeof LOCATION_LABELS];
  return null;
}

const MAP: Record<(typeof LOCATION_SLUGS)[number], unknown> = {
  "castello-de-la-plana": castello,
  borriol,
  almassora,
  "vila-real": vilaReal,
  benicassim,
  borriana,
  orpesa,
  "sant-joan-de-moro": santJoanDeMoro,
  vilafames,
  "la-pobla-tornesa": laPoblaTornesa,
  "l-alcora": lAlcora,
  cabanes,
  onda,
  nules,
  "la-vall-duixo": laVallDuixo,
  "provincia-castellon": provincia
};

export function getLocationRaw(slug: string): unknown | null {
  if (slug in MAP) {
    const raw = MAP[slug as keyof typeof MAP] as any;
    const obj = (raw?.default ?? raw) as any;
    const label = getLocationLabel(slug) ?? "Provincia de Castellón";
    return injectWorkGallery(obj, `location:${slug}`, `Trabajos en ${label}`);
  }
  return null;
}