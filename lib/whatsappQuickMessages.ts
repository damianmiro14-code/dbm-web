import { getServiceLabel } from "@/lib/servicePages";

/**
 * Quick WhatsApp message templates per service.
 *
 * Goal: 1-click "servicio rápido" with a prefilled message.
 * Users can use "Especificar mi trabajo" for the detailed form.
 */
export function getQuickWhatsAppMessage(serviceSlug?: string, serviceLabel?: string): string {
  const label =
    serviceLabel ??
    (serviceSlug ? getServiceLabel(serviceSlug) ?? serviceSlug : "Trabajo de carpintería metálica");

  // Base skeleton used by all quick messages.
  const base = (lines: string[]) =>
    [
      `Hola, quiero presupuesto rápido para: ${label}.`,
      "",
      ...lines,
      "",
      "Puedo enviar fotos y más detalles a continuación.",
      "Gracias."
    ].join("\n");

  switch (serviceSlug) {
    case "soldadura":
      return base([
        "Localidad: (indicar)",
        "Tipo de pieza/trabajo: (indicar)",
        "Material (hierro/inox): (indicar)",
        "Espesor aproximado: (indicar)",
        "¿En taller o a domicilio?: (indicar)",
        "Plazo: (indicar)"
      ]);

    case "rejas":
      return base([
        "Localidad: (indicar)",
        "Medidas aprox (ancho x alto): (indicar)",
        "Unidades: (indicar)",
        "Material/acabado (hierro, galvanizado, lacado...): (indicar)",
        "Montaje: (sí/no)",
        "Plazo: (indicar)"
      ]);

    case "barandillas":
    case "barandillas-inox":
      return base([
        "Localidad: (indicar)",
        "Metros lineales aprox: (indicar)",
        "Altura/medidas aprox: (indicar)",
        "Material (inox 304/316 o hierro): (indicar)",
        "Montaje: (sí/no)",
        "Plazo: (indicar)"
      ]);

    case "techos-y-cubiertas":
    case "techos":
    case "cubiertas":
      return base([
        "Localidad: (indicar)",
        "Medidas aprox (ancho x alto): (indicar)",
        "m² aprox: (indicar)",
        "Estructura incluida: (sí/no)",
        "Altura de trabajo: (indicar)",
        "Plazo: (indicar)"
      ]);

    case "estructuras-metalicas":
    case "estructura-metalica":
      return base([
        "Localidad: (indicar)",
        "Tipo de estructura (IPN/HEB, etc.): (indicar)",
        "Metros/medidas aprox: (indicar)",
        "Montaje: (sí/no)",
        "Altura/acceso: (indicar)",
        "Plazo: (indicar)"
      ]);

    default:
      return base([
        "Localidad: (indicar)",
        "Medidas aproximadas: (indicar)",
        "Material/acabado: (indicar)",
        "Montaje: (sí/no)",
        "Plazo: (indicar)"
      ]);
  }
}
