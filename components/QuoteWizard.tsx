"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { addLead } from "@/lib/leads";

function normalizePhoneE164(phoneE164: string) {
  const p = phoneE164.replace(/\s+/g, "");
  return p.startsWith("+") ? p : `+${p}`;
}

function toWhatsAppUrl(phoneE164: string, text: string) {
  const normalized = normalizePhoneE164(phoneE164);
  const phone = normalized.slice(1); // wa.me expects country code without '+'
  const params = new URLSearchParams({ text });
  return `https://wa.me/${phone}?${params.toString()}`;
}

type QuoteDraft = {
  service: string;
  location: string;
  measurements: string;
  material: string;
  install: "sí" | "no" | "no lo sé";
  urgency: "hoy" | "esta semana" | "este mes" | "sin prisa";
  details: string;
  name: string;
  phone: string;
};

const STORAGE_KEY = "dbm_quote_draft_v1";

const SERVICE_OPTIONS = [
  "Soldadura",
  "Carpintería metálica a medida",
  "Puertas, rejas y cerramientos",
  "Estructuras metálicas",
  "Montajes industriales",
  "Inox (barandillas, escaleras, etc.)",
  "Techos y cubiertas",
  "Panel sándwich",
  "Cerramientos industriales",
  "Cerraduras y refuerzos",
  "Escaleras metálicas",
  "Otro"
];

const MATERIAL_OPTIONS = ["Hierro", "Inox", "Aluminio", "No lo sé"];

// Optional prefill for /presupuesto?service=<slug|label>
const SERVICE_SLUG_TO_LABEL: Record<string, string> = {
  "soldadura": "Soldadura",
  "carpinteria-metalica-a-medida": "Carpintería metálica a medida",
  "puertas-rejas-cerramientos": "Puertas, rejas y cerramientos",
  "estructuras-metalicas": "Estructuras metálicas",
  "montajes-industriales": "Montajes industriales",
  "inox": "Inox (barandillas, escaleras, etc.)",
  "techos-cubiertas": "Techos y cubiertas",
  "panel-sandwich": "Panel sándwich",
  "cerramientos-paramentos-industriales": "Cerramientos industriales",
  "cerraduras-refuerzos": "Cerraduras y refuerzos",
  "escaleras-metalicas": "Escaleras metálicas"
};

function safeParseDraft(value: string | null): QuoteDraft | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as QuoteDraft;
  } catch {
    return null;
  }
}

export default function QuoteWizard({ phoneE164 }: { phoneE164: string }) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [draft, setDraft] = useState<QuoteDraft>({
    service: "Soldadura",
    location: "",
    measurements: "",
    material: "No lo sé",
    install: "no lo sé",
    urgency: "esta semana",
    details: "",
    name: "",
    phone: ""
  });

  // Load draft
  useEffect(() => {
    const stored = safeParseDraft(localStorage.getItem(STORAGE_KEY));
    if (stored) setDraft(stored);
  }, []);

  // Prefill service from query string when present.
  // Examples:
  // - /presupuesto?service=soldadura
  // - /presupuesto?service=Puertas%2C%20rejas%20y%20cerramientos
  const prefillService = useMemo(() => {
    const raw = (searchParams.get("service") || searchParams.get("s") || "").trim();
    if (!raw) return null;

    const asSlug = raw.toLowerCase();
    if (asSlug in SERVICE_SLUG_TO_LABEL) return SERVICE_SLUG_TO_LABEL[asSlug];

    // Try match label against options (case-insensitive)
    const normalized = raw.toLowerCase();
    const match = SERVICE_OPTIONS.find((o) => o.toLowerCase() == normalized);
    return match || null;
  }, [searchParams]);

  useEffect(() => {
    if (!prefillService) return;
    setDraft((d) => ({ ...d, service: prefillService }));
    // Keep UX predictable: start from step 1 when user arrives via service CTA
    setStep(1);
    track("prefill_service", { value: prefillService });
  }, [prefillService]);

  // Persist draft
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const message = useMemo(() => {
    const lines = [
      "Hola, necesito presupuesto para:",
      `• Servicio: ${draft.service || "—"}`,
      `• Ubicación: ${draft.location || "—"}`,
      `• Medidas aproximadas: ${draft.measurements || "—"}`,
      `• Material: ${draft.material || "—"}`,
      `• ¿Incluye instalación?: ${draft.install}`,
      `• Urgencia: ${draft.urgency}`,
      draft.details ? `• Detalles: ${draft.details}` : "",
      "",
      draft.name || draft.phone ? "Datos de contacto:" : "",
      draft.name ? `• Nombre: ${draft.name}` : "",
      draft.phone ? `• Teléfono: ${draft.phone}` : "",
    ].filter(Boolean);

    return lines.join("\n");
  }, [draft]);

  const waUrl = useMemo(() => toWhatsAppUrl(phoneE164, message), [phoneE164, message]);

  function update<K extends keyof QuoteDraft>(key: K, value: QuoteDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(message);
      // micro feedback without toast lib
      alert("Mensaje copiado. Pégalo en WhatsApp si lo necesitas.");
    } catch {
      alert("No se pudo copiar automáticamente. Selecciona y copia el texto manualmente.");
    }
  }

  function resetDraft() {
    localStorage.removeItem(STORAGE_KEY);
    setDraft({
      service: "Soldadura",
      location: "",
      measurements: "",
      material: "No lo sé",
      install: "no lo sé",
      urgency: "esta semana",
      details: "",
      name: "",
      phone: ""
    });
    setStep(1);
  }

  return (
    <div className="rounded-2xl border border-border p-5 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-70">Presupuesto rápido</p>
          <h2 className="mt-1 text-xl md:text-2xl font-semibold">En 1 minuto</h2>
        </div>
        <div className="text-sm opacity-70">Paso {step}/3</div>
      </div>

      <div className="mt-5 h-2 w-full rounded-full bg-black/10 overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-black transition-all duration-200"
          style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
        />
      </div>

      {step === 1 ? (
        <div className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-medium">¿Qué necesitas?</label>
            <select
              className="mt-2 w-full rounded-xl border border-border px-4 py-3"
              value={draft.service}
              onChange={(e) => update("service", e.target.value)}
            >
              {SERVICE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Ubicación (municipio/barrio)</label>
            <input
              className="mt-2 w-full rounded-xl border border-border px-4 py-3"
              placeholder="Ej. Castelló de la Plana, Borriol…"
              value={draft.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button className="w-full" onClick={() => setStep(2)}>
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-medium">Medidas aproximadas</label>
            <input
              className="mt-2 w-full rounded-xl border border-border px-4 py-3"
              placeholder="Ej. 2,5 m ancho x 2 m alto, o 4 metros lineales…"
              value={draft.measurements}
              onChange={(e) => update("measurements", e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Material</label>
              <select
                className="mt-2 w-full rounded-xl border border-border px-4 py-3"
                value={draft.material}
                onChange={(e) => update("material", e.target.value)}
              >
                {MATERIAL_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">¿Incluye instalación?</label>
              <select
                className="mt-2 w-full rounded-xl border border-border px-4 py-3"
                value={draft.install}
                onChange={(e) => update("install", e.target.value as QuoteDraft["install"])}
              >
                <option value="sí">Sí</option>
                <option value="no">No</option>
                <option value="no lo sé">No lo sé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Urgencia</label>
            <select
              className="mt-2 w-full rounded-xl border border-border px-4 py-3"
              value={draft.urgency}
              onChange={(e) => update("urgency", e.target.value as QuoteDraft["urgency"])}
            >
              <option value="hoy">Hoy</option>
              <option value="esta semana">Esta semana</option>
              <option value="este mes">Este mes</option>
              <option value="sin prisa">Sin prisa</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Detalles (opcional)</label>
            <textarea
              className="mt-2 w-full rounded-xl border border-border px-4 py-3 min-h-[110px]"
              placeholder="Ej. Puerta corredera para entrada, acabado lacado, anclaje a pared…"
              value={draft.details}
              onChange={(e) => update("details", e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="w-full sm:w-auto" variant="secondary" onClick={() => setStep(1)}>
              Atrás
            </Button>
            <Button className="w-full sm:w-auto" onClick={() => setStep(3)}>
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tu nombre (opcional)</label>
              <input
                className="mt-2 w-full rounded-xl border border-border px-4 py-3"
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tu teléfono (opcional)</label>
              <input
                className="mt-2 w-full rounded-xl border border-border px-4 py-3"
                value={draft.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Resumen del mensaje</label>
            <textarea
              className="mt-2 w-full rounded-xl border border-border px-4 py-3 min-h-[180px]"
              value={message}
              readOnly
            />
            <p className="mt-2 text-sm opacity-70">
              Consejo: al abrir WhatsApp, envía después las fotos/planos como adjuntos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="w-full sm:w-auto" variant="secondary" onClick={() => setStep(2)}>
              Atrás
            </Button>
            <Button className="w-full sm:w-auto" variant="secondary" onClick={copyToClipboard}>
              Copiar mensaje
            </Button>
            <Button
              className="w-full sm:w-auto"
              href={waUrl}
              onClick={() =>
                {
                  addLead({
                    source: "presupuesto",
                    service: draft.service,
                    location: draft.location,
                    name: draft.name,
                    phone: draft.phone,
                    message,
                    meta: {
                      measurements: draft.measurements,
                      material: draft.material,
                      install: draft.install,
                      urgency: draft.urgency
                    }
                  });
                  track("lead_quote_whatsapp", {
                    service: draft.service,
                    urgency: draft.urgency,
                    has_files: false
                  });
                }
              }
            >
              Abrir WhatsApp
            </Button>
          </div>

          <div className="mt-3">
            <button className="text-sm underline opacity-70 hover:opacity-100" onClick={resetDraft}>
              Reiniciar formulario
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
