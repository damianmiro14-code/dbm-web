import soldadura from "@/content/es/services/soldadura.json";
import carpinteriaMetalicaAMedida from "@/content/es/services/carpinteria-metalica-a-medida.json";
import puertasRejasCerramientos from "@/content/es/services/puertas-rejas-cerramientos.json";
import estructurasMetalicas from "@/content/es/services/estructuras-metalicas.json";
import montajesIndustriales from "@/content/es/services/montajes-industriales.json";
import inox from "@/content/es/services/inox.json";
import techosCubiertas from "@/content/es/services/techos-cubiertas.json";
import panelSandwich from "@/content/es/services/panel-sandwich.json";
import cerramientosParamentosIndustriales from "@/content/es/services/cerramientos-paramentos-industriales.json";
import cerradurasRefuerzos from "@/content/es/services/cerraduras-refuerzos.json";
import escalerasMetalicas from "@/content/es/services/escaleras-metalicas.json";
import { injectWorkGallery } from "@/lib/galleryInject";

export const SERVICE_SLUGS = [
  "soldadura",
  "carpinteria-metalica-a-medida",
  "puertas-rejas-cerramientos",
  "estructuras-metalicas",
  "montajes-industriales",
  "inox",
  "techos-cubiertas",
  "panel-sandwich",
  "cerramientos-paramentos-industriales",
  "cerraduras-refuerzos",
  "escaleras-metalicas"
] as const;
export const SERVICE_LABELS: Record<(typeof SERVICE_SLUGS)[number], string> = {
  soldadura: "Soldadura",
  "carpinteria-metalica-a-medida": "Carpintería metálica a medida",
  "puertas-rejas-cerramientos": "Puertas, rejas y cerramientos",
  "estructuras-metalicas": "Estructuras metálicas",
  "montajes-industriales": "Montajes industriales",
  inox: "Inox",
  "techos-cubiertas": "Techos y cubiertas",
  "panel-sandwich": "Panel sándwich",
  "cerramientos-paramentos-industriales": "Cerramientos industriales",
  "cerraduras-refuerzos": "Cerraduras y refuerzos",
  "escaleras-metalicas": "Escaleras metálicas"
};

export function getServiceLabel(slug: string): string | null {
  if (slug in SERVICE_LABELS) return SERVICE_LABELS[slug as keyof typeof SERVICE_LABELS];
  return null;
}

const MAP: Record<(typeof SERVICE_SLUGS)[number], unknown> = {
  soldadura,
  "carpinteria-metalica-a-medida": carpinteriaMetalicaAMedida,
  "puertas-rejas-cerramientos": puertasRejasCerramientos,
  "estructuras-metalicas": estructurasMetalicas,
  "montajes-industriales": montajesIndustriales,
  inox,
  "techos-cubiertas": techosCubiertas,
  "panel-sandwich": panelSandwich,
  "cerramientos-paramentos-industriales": cerramientosParamentosIndustriales,
  "cerraduras-refuerzos": cerradurasRefuerzos,
  "escaleras-metalicas": escalerasMetalicas
};

export function getServiceRaw(slug: string): unknown | null {
  if (slug in MAP) {
    // Some bundlers can wrap JSON default exports (e.g. { default: {...} }).
    // Normalize to the actual JSON object to avoid runtime crashes.
    const raw = MAP[slug as keyof typeof MAP] as any;
    const obj = (raw?.default ?? raw) as any;
    const label = getServiceLabel(slug) ?? "Carpintería metálica";
    return injectWorkGallery(obj, `service:${slug}`, `Trabajos de ${label}`);
  }
  return null;
}