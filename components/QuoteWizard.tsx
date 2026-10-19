"use client";
import DBMSelect from "@/components/ui/DBMSelect";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { sessionDraftGet, sessionDraftSet, sessionDraftRemove } from "@/lib/sessionDraft";

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
    const stored = safeParseDraft(sessionDraftGet(STORAGE_KEY));
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
    sessionDraftSet(STORAGE_KEY, JSON.stringify(draft));
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
    sessionDraftRemove(STORAGE_KEY);
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
    <div className="relative overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white p-5 text-[#17191B] shadow-[0_20px_65px_-38px_rgba(0,0,0,0.3)] sm:p-7 md:p-9">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[#F97316]" />
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EDEFF1] pb-5">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#EA580C]">Presupuesto rápido</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#161A1D] md:text-3xl">En 1 minuto</h2>
        </div>
        <div className="rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-4 py-2 text-sm font-bold text-[#9A3412]">Paso {step} de 3</div>
      </div>

      <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[#ECEFF1]" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[#F97316] transition-[width] duration-300 ease-out"
          style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
        />
      </div>

      {step === 1 ? (
        <div className="mt-6 grid gap-5">
          <div className="flex items-center gap-3 rounded-2xl border border-[#FFEDD5] bg-[#FFF7ED] p-4 sm:p-5">
            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F97316] text-base font-extrabold text-[#17191B]">01</span>
            <div>
              <p className="text-base font-extrabold tracking-tight text-[#1B2024]">Cuéntanos tu idea</p>
              <p className="mt-0.5 text-sm leading-5 text-[#59636E]">Indica el tipo de trabajo y la localidad.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold tracking-tight text-[#23272A]">¿Qué necesitas?</label>
                          <DBMSelect
                ariaLabel="¿Qué necesitas?"
                value={draft.service}
                onChange={(next) => update("service", next)}
                options={SERVICE_OPTIONS.map((item) => ({ value: item, label: item }))}
              />
          </div>

          <div>
            <label className="block text-sm font-semibold tracking-tight text-[#23272A]">Ubicación (municipio/barrio)</label>
            <input
              className="mt-2 block min-h-[50px] w-full rounded-xl border border-[#D8DEE5] bg-[#FCFCFC] px-4 py-3 text-base text-[#17202B] shadow-sm outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-slate-400 hover:border-[#9CA9B7] focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20"
              placeholder="Ej. Castelló de la Plana, Borriol…"
              value={draft.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button className="min-h-[48px] w-full !border-[#F97316] !bg-[#F97316] px-6 py-3 font-bold !text-[#151515] hover:!border-[#EA580C] hover:!bg-[#EA580C] focus-visible:!ring-[#F97316] sm:w-auto sm:!w-full" onClick={() => setStep(2)}>
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 grid gap-5">
          <div className="flex items-center gap-3 rounded-2xl border border-[#FFEDD5] bg-[#FFF7ED] p-4 sm:p-5">
            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F97316] text-base font-extrabold text-[#17191B]">02</span>
            <div>
              <p className="text-base font-extrabold tracking-tight text-[#1B2024]">Medidas y acabados</p>
              <p className="mt-0.5 text-sm leading-5 text-[#59636E]">Añade los detalles que conozcas; no hace falta que sean exactos.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold tracking-tight text-[#23272A]">Medidas aproximadas</label>
            <input
              className="mt-2 block min-h-[50px] w-full rounded-xl border border-[#D8DEE5] bg-[#FCFCFC] px-4 py-3 text-base text-[#17202B] shadow-sm outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-slate-400 hover:border-[#9CA9B7] focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20"
              placeholder="Ej. 2,5 m ancho x 2 m alto, o 4 metros lineales…"
              value={draft.measurements}
              onChange={(e) => update("measurements", e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold tracking-tight text-[#23272A]">Material</label>
                              <DBMSelect
                  ariaLabel="Material"
                  value={draft.material}
                  onChange={(next) => update("material", next)}
                  options={MATERIAL_OPTIONS.map((item) => ({ value: item, label: item }))}
                />
            </div>
            <div>
              <label className="block text-sm font-semibold tracking-tight text-[#23272A]">¿Incluye instalación?</label>
                              <DBMSelect
                  ariaLabel="¿Incluye instalación?"
                  value={draft.install}
                  onChange={(next) => update("install", next as QuoteDraft["install"])}
                  options={[
                    { value: "sí", label: "Sí" },
                    { value: "no", label: "No" },
                    { value: "no lo sé", label: "No lo sé" }
                  ]}
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold tracking-tight text-[#23272A]">Urgencia</label>
                          <DBMSelect
                ariaLabel="Urgencia"
                value={draft.urgency}
                onChange={(next) => update("urgency", next as QuoteDraft["urgency"])}
                options={[
                  { value: "hoy", label: "Hoy" },
                  { value: "esta semana", label: "Esta semana" },
                  { value: "este mes", label: "Este mes" },
                  { value: "sin prisa", label: "Sin prisa" }
                ]}
              />
          </div>

          <div>
            <label className="block text-sm font-semibold tracking-tight text-[#23272A]">Detalles (opcional)</label>
            <textarea
              className="mt-2 block min-h-[50px] w-full rounded-xl border border-[#D8DEE5] bg-[#FCFCFC] px-4 py-3 text-base text-[#17202B] shadow-sm outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-slate-400 hover:border-[#9CA9B7] focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20 min-h-[125px] resize-y"
              placeholder="Ej. Puerta corredera para entrada, acabado lacado, anclaje a pared…"
              value={draft.details}
              onChange={(e) => update("details", e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="min-h-[48px] w-full !border-[#BBC4CE] !bg-white px-6 py-3 font-semibold !text-[#23272A] hover:!border-[#1B2024] hover:!bg-[#F3F4F6] focus-visible:!ring-[#F97316] sm:w-auto" variant="secondary" onClick={() => setStep(1)}>
              Atrás
            </Button>
            <Button className="min-h-[48px] w-full !border-[#F97316] !bg-[#F97316] px-6 py-3 font-bold !text-[#151515] hover:!border-[#EA580C] hover:!bg-[#EA580C] focus-visible:!ring-[#F97316] sm:w-auto" onClick={() => setStep(3)}>
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 grid gap-5">
          <div className="flex items-center gap-3 rounded-2xl border border-[#FFEDD5] bg-[#FFF7ED] p-4 sm:p-5">
            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F97316] text-base font-extrabold text-[#17191B]">03</span>
            <div>
              <p className="text-base font-extrabold tracking-tight text-[#1B2024]">Revisa tu solicitud</p>
              <p className="mt-0.5 text-sm leading-5 text-[#59636E]">Comprueba el mensaje antes de abrir WhatsApp.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold tracking-tight text-[#23272A]">Tu nombre (opcional)</label>
              <input
                className="mt-2 block min-h-[50px] w-full rounded-xl border border-[#D8DEE5] bg-[#FCFCFC] px-4 py-3 text-base text-[#17202B] shadow-sm outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-slate-400 hover:border-[#9CA9B7] focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20"
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold tracking-tight text-[#23272A]">Tu teléfono (opcional)</label>
              <input
                className="mt-2 block min-h-[50px] w-full rounded-xl border border-[#D8DEE5] bg-[#FCFCFC] px-4 py-3 text-base text-[#17202B] shadow-sm outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-slate-400 hover:border-[#9CA9B7] focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20"
                value={draft.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold tracking-tight text-[#23272A]">Resumen del mensaje</label>
            <textarea
              className="mt-2 block min-h-[50px] w-full rounded-xl border border-[#D8DEE5] bg-[#FCFCFC] px-4 py-3 text-base text-[#17202B] shadow-sm outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-slate-400 hover:border-[#9CA9B7] focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/20 min-h-[185px] resize-y bg-[#F8FAFC] text-sm leading-relaxed"
              value={message}
              readOnly
            />
            <p className="mt-2 text-sm opacity-70">
              Consejo: al abrir WhatsApp, envía después las fotos/planos como adjuntos.
            </p>
            <p className="mt-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-3 text-xs leading-5 text-[#475569]">
              Responsable: Damián Brajkovic Miro (DBM). Usamos los datos para atender tu presupuesto.
              Al abrir WhatsApp aún tendrás que enviar el mensaje. Consulta tus derechos y el tratamiento en
              <a className="ml-1 font-semibold text-[#C2410C] underline underline-offset-2 focus-visible:outline-[#F97316]" href="/privacidad">Privacidad</a>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="min-h-[48px] w-full !border-[#BBC4CE] !bg-white px-6 py-3 font-semibold !text-[#23272A] hover:!border-[#1B2024] hover:!bg-[#F3F4F6] focus-visible:!ring-[#F97316] sm:w-auto" variant="secondary" onClick={() => setStep(2)}>
              Atrás
            </Button>
            <Button className="min-h-[48px] w-full !border-[#BBC4CE] !bg-white px-6 py-3 font-semibold !text-[#23272A] hover:!border-[#1B2024] hover:!bg-[#F3F4F6] focus-visible:!ring-[#F97316] sm:w-auto" variant="secondary" onClick={copyToClipboard}>
              Copiar mensaje
            </Button>
            <Button
              className="min-h-[48px] w-full !border-[#F97316] !bg-[#F97316] px-6 py-3 font-bold !text-[#151515] hover:!border-[#EA580C] hover:!bg-[#EA580C] focus-visible:!ring-[#F97316] sm:w-auto"
              href={waUrl}
              onClick={() =>
                {
                  track("quote_whatsapp_open_intent", {
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
            <button className="text-sm font-semibold text-[#64748B] underline decoration-[#F97316] underline-offset-4 hover:text-[#1B2024] focus-visible:outline-[#F97316]" onClick={resetDraft}>
              Reiniciar formulario
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
