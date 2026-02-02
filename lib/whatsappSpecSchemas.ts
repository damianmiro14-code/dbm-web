import type { SpecField } from "@/components/WhatsAppSpecModal";

// Field sets per service slug. Keep them short and practical.
// The goal is to generate a WhatsApp message that contains the minimum specs needed to price.

export function getWhatsAppSpecFields(serviceSlug?: string, serviceLabel?: string): SpecField[] | undefined {
  if (!serviceSlug) return undefined;

  switch (serviceSlug) {
    case "puertas-rejas-cerramientos":
      return [
        { id: "tipo", label: "Tipo", type: "select", options: ["Reja", "Puerta", "Cerramiento", "Otro"], required: true },
        { id: "ancho", label: "Ancho (m)", type: "number", placeholder: "Ej.: 2,00", required: true },
        { id: "alto", label: "Alto (m)", type: "number", placeholder: "Ej.: 1,20", required: true },
        { id: "unidades", label: "Unidades", type: "number", placeholder: "Ej.: 1", required: true },
        { id: "material", label: "Material / acabado", type: "select", options: ["Hierro", "Galvanizado", "Inox", "Lacado", "No lo sé"], required: true },
        { id: "montaje", label: "Montaje", type: "select", options: ["Sí (instalación)", "No (solo fabricación)", "No lo sé"], required: true },
        { id: "localidad", label: "Localidad", type: "text", placeholder: "Ej.: Borriol / Castellón", required: true },
        { id: "foto", label: "Foto", type: "select", options: ["Sí, adjunto foto por WhatsApp", "No tengo foto"] },
        { id: "notas", label: "Notas", type: "textarea", placeholder: "Anclajes, altura, retirada, accesos...", rows: 4 }
      ];

    case "panel-sandwich":
    case "techos-cubiertas":
      return [
        { id: "m2", label: "m² aproximados", type: "number", placeholder: "Ej.: 35", required: true },
        { id: "espesor", label: "Espesor", type: "select", options: ["30mm", "40mm", "50mm", "60mm", "80mm", "No lo sé"], required: true },
        { id: "estructura", label: "Estructura", type: "select", options: ["Con estructura", "Sin estructura", "No lo sé"], required: true },
        { id: "remates", label: "Remates/canalón", type: "select", options: ["Sí", "No", "No lo sé"] },
        { id: "altura", label: "Altura de trabajo", type: "select", options: ["A ras", "Escalera", "Andamio", "Plataforma", "No lo sé"] },
        { id: "localidad", label: "Localidad", type: "text", placeholder: "Ej.: Borriol / Castellón", required: true },
        { id: "foto", label: "Foto", type: "select", options: ["Sí, adjunto foto por WhatsApp", "No tengo foto"] },
        { id: "notas", label: "Notas", type: "textarea", placeholder: "Accesos, retirada, fecha aproximada...", rows: 4 }
      ];

    case "soldadura":
      return [
        { id: "tipo", label: "Qué hay que soldar", type: "text", placeholder: "Ej.: reja rota, soporte, estructura...", required: true },
        { id: "material", label: "Material", type: "select", options: ["Hierro", "Inox", "Aluminio", "No lo sé"], required: true },
        { id: "espesor", label: "Espesor aprox.", type: "select", options: ["Fino (1-2mm)", "Medio (3-5mm)", "Grueso (6mm+)", "No lo sé"] },
        { id: "cantidad", label: "Cantidad", type: "text", placeholder: "Ej.: 3 puntos / 2m cordón", required: true },
        { id: "localidad", label: "Localidad", type: "text", placeholder: "Ej.: Borriol / Castellón", required: true },
        { id: "foto", label: "Foto", type: "select", options: ["Sí, adjunto foto por WhatsApp", "No tengo foto"] },
        { id: "urgencia", label: "Urgencia", type: "select", options: ["Normal", "Esta semana", "Urgente"] },
        { id: "notas", label: "Notas", type: "textarea", placeholder: "Acceso, altura, si hay que desmontar...", rows: 4 }
      ];

    case "inox":
      return [
        { id: "tipo", label: "Tipo", type: "select", options: ["Barandilla", "Pasamanos", "Estructura", "Otro"], required: true },
        { id: "metros", label: "Metros (aprox.)", type: "number", placeholder: "Ej.: 6", required: true },
        { id: "acabado", label: "Acabado", type: "select", options: ["Satinado", "Pulido", "No lo sé"], required: true },
        { id: "montaje", label: "Montaje", type: "select", options: ["Sí", "No", "No lo sé"], required: true },
        { id: "localidad", label: "Localidad", type: "text", placeholder: "Ej.: Borriol / Castellón", required: true },
        { id: "foto", label: "Foto", type: "select", options: ["Sí, adjunto foto por WhatsApp", "No tengo foto"] },
        { id: "notas", label: "Notas", type: "textarea", placeholder: "Altura, anclajes, vidrio, etc.", rows: 4 }
      ];

    case "montajes-industriales":
      return [
        { id: "tarea", label: "Qué hay que montar", type: "text", placeholder: "Ej.: estructura, maquinaria, soporte...", required: true },
        { id: "horas", label: "Horas estimadas", type: "number", placeholder: "Ej.: 4", required: true },
        { id: "equipo", label: "Equipo", type: "select", options: ["1 operario", "2 operarios", "No lo sé"], required: true },
        { id: "localidad", label: "Localidad", type: "text", placeholder: "Ej.: Borriol / Castellón", required: true },
        { id: "foto", label: "Foto", type: "select", options: ["Sí, adjunto foto por WhatsApp", "No tengo foto"] },
        { id: "notas", label: "Notas", type: "textarea", placeholder: "Turnos, accesos, elevación...", rows: 4 }
      ];

    default:
      // For other services, fall back to generic fields in the modal.
      return undefined;
  }
}
