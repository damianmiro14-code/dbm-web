import type { SpecField } from "@/components/WhatsAppSpecModal";

/**
 * Campos "rápidos": pocos campos, pensados para no frenar al usuario.
 * El usuario siempre puede usar "Especificar mi trabajo" para el formulario detallado.
 */
export function getWhatsAppQuickFields(serviceSlug?: string, serviceLabel?: string): SpecField[] {
  const baseLocalidad: SpecField = {
    id: "localidad",
    label: "Localidad",
    type: "text",
    placeholder: "Ej.: Borriol / Castellón",
    required: false
  };

  const basePlazo: SpecField = {
    id: "plazo",
    label: "Plazo",
    type: "select",
    options: ["Sin prisa", "Esta semana", "Urgente"]
  };

  // En WhatsApp no podemos adjuntar archivos automáticamente desde la web.
  // Este campo sirve para guiar al cliente y que tú sepas si enviará foto.
  const baseFoto: SpecField = {
    id: "foto",
    label: "Foto",
    type: "select",
    options: ["Sí, adjunto foto por WhatsApp", "No tengo foto"]
  };

  switch (serviceSlug) {
    case "soldadura":
      return [
        baseLocalidad,
        {
          id: "tipo",
          label: "Tipo de pieza/trabajo",
          type: "text",
          placeholder: "Ej.: bisagra, soporte, reparación..."
        },
        {
          id: "medidas",
          label: "Medidas aproximadas",
          type: "text",
          placeholder: "Ej.: 40cm, 1m, etc. (si aplica)"
        },
        {
          id: "material",
          label: "Material",
          type: "select",
          options: ["Hierro", "Inox", "No lo sé"]
        },
        {
          id: "espesor",
          label: "Espesor aproximado",
          type: "text",
          placeholder: "Ej.: 2mm / 5mm"
        },
        {
          id: "domicilio",
          label: "¿En taller o a domicilio?",
          type: "select",
          options: ["En taller", "A domicilio", "No lo sé"]
        },
        basePlazo,
        baseFoto
      ];

    case "rejas":
      return [
        baseLocalidad,
        {
          id: "ancho",
          label: "Ancho (m)",
          type: "number",
          placeholder: "Ej.: 1,20",
          step: 0.01
        },
        {
          id: "alto",
          label: "Alto (m)",
          type: "number",
          placeholder: "Ej.: 1,10",
          step: 0.01
        },
        {
          id: "unidades",
          label: "Unidades",
          type: "number",
          placeholder: "Ej.: 2",
          step: 1
        },
        {
          id: "acabado",
          label: "Material / acabado",
          type: "select",
          options: ["Hierro", "Galvanizado", "Lacado", "No lo sé"]
        },
        {
          id: "montaje",
          label: "Montaje",
          type: "select",
          options: ["Sí (instalación)", "No (solo fabricación)", "No lo sé"]
        },
        basePlazo,
        baseFoto
      ];

    case "barandillas":
    case "barandillas-inox":
      return [
        baseLocalidad,
        {
          id: "metros",
          label: "Metros lineales aprox",
          type: "number",
          placeholder: "Ej.: 6,5",
          step: 0.1
        },
        {
          id: "altura",
          label: "Altura/medidas aprox",
          type: "text",
          placeholder: "Ej.: 1m / con cristal..."
        },
        {
          id: "material",
          label: "Material",
          type: "select",
          options: ["Inox 304", "Inox 316", "Hierro", "No lo sé"]
        },
        {
          id: "montaje",
          label: "Montaje",
          type: "select",
          options: ["Sí (instalación)", "No (solo fabricación)", "No lo sé"]
        },
        basePlazo,
        baseFoto
      ];

    case "techos-y-cubiertas":
    case "techos":
    case "cubiertas":
      return [
        baseLocalidad,
        {
          id: "ancho",
          label: "Ancho (m)",
          type: "number",
          placeholder: "Ej.: 4,20",
          step: 0.01
        },
        {
          id: "alto",
          label: "Alto (m)",
          type: "number",
          placeholder: "Ej.: 3,00",
          step: 0.01
        },
        {
          id: "estructura",
          label: "Estructura incluida",
          type: "select",
          options: ["Sí", "No", "No lo sé"]
        },
        {
          id: "alturaTrabajo",
          label: "Altura de trabajo",
          type: "select",
          options: ["0–3 m", "3–6 m", "+6 m", "No lo sé"]
        },
        basePlazo,
        baseFoto
      ];

    default:
      // Generic quick fields.
      return [
        baseLocalidad,
        {
          id: "tipo",
          label: "Trabajo",
          type: "text",
          placeholder: "Ej.: reja, puerta, barandilla, estructura..."
        },
        {
          id: "medidas",
          label: "Medidas aproximadas",
          type: "text",
          placeholder: "Ej.: 2,0m ancho x 1,2m alto / 6m lineales"
        },
        {
          id: "material",
          label: "Material / acabado",
          type: "select",
          options: ["Hierro", "Galvanizado", "Inox", "Lacado", "No lo sé"]
        },
        {
          id: "montaje",
          label: "Montaje",
          type: "select",
          options: ["Sí (instalación)", "No (solo fabricación)", "No lo sé"]
        },
        basePlazo,
        baseFoto
      ];
  }
}

export function getVisitFields(serviceLabel?: string): SpecField[] {
  return [
    {
      id: "localidad",
      label: "Localidad",
      type: "text",
      placeholder: "Ej.: Borriol / Castellón"
    },
    {
      id: "tipo",
      label: "Trabajo",
      type: "text",
      placeholder: "Ej.: reja, puerta, barandilla..."
    },
    {
      id: "medidas",
      label: "Medidas aproximadas",
      type: "text",
      placeholder: "Ej.: 2,0m ancho x 1,2m alto / 6m lineales"
    },
    {
      id: "disponibilidad",
      label: "Disponibilidad aproximada",
      type: "text",
      placeholder: "Ej.: tardes / esta semana / fin de semana"
    },
    {
      id: "foto",
      label: "Foto",
      type: "select",
      options: ["Sí, adjunto foto por WhatsApp", "No tengo foto"]
    },
    {
      id: "notas",
      label: "Notas",
      type: "textarea",
      placeholder: "Acceso, altura, referencias, etc.",
      rows: 3
    }
  ];
}
