"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import WhatsAppQuickModal from "@/components/WhatsAppQuickModal";
import { getVisitFields, getWhatsAppQuickFields } from "@/lib/whatsappQuickFields";
import { track } from "@/lib/analytics";

type ContactWhatsAppActions = {
  openQuick: () => void;
  openVisit: () => void;
};

const ContactWhatsAppContext = createContext<ContactWhatsAppActions | null>(null);

function useContactWhatsApp() {
  const ctx = useContext(ContactWhatsAppContext);
  if (!ctx) throw new Error("ContactWhatsAppProvider is required for contact actions");
  return ctx;
}

/** One modal pair and one draft per mode, shared by all Contacto V2 CTAs. */
export function ContactWhatsAppProvider({ phoneE164, children }: { phoneE164: string; children: ReactNode }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const quickFields = useMemo(() => getWhatsAppQuickFields(undefined, undefined), []);
  const visitFields = useMemo(() => getVisitFields(undefined), []);

  const openQuick = () => {
    setQuickOpen(true);
    track("whatsapp_quick_open", { mode: "quick", service: "global", context: "contact" });
  };
  const openVisit = () => {
    setVisitOpen(true);
    track("booking_open", { mode: "visit", service: "global", context: "contact" });
  };

  return (
    <ContactWhatsAppContext.Provider value={{ openQuick, openVisit }}>
      {children}
      <WhatsAppQuickModal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        phoneE164={phoneE164}
        mode="quick"
        title="WhatsApp rápido"
        introLine="Hola, quiero pedir un presupuesto."
        fields={quickFields}
        submitLabel="Abrir WhatsApp con el mensaje"
        draftKey="quick:global"
        onSubmitTrack={() => track("whatsapp_quick_open_intent", { mode: "quick", service: "global", context: "contact" })}
      />
      <WhatsAppQuickModal
        open={visitOpen}
        onClose={() => setVisitOpen(false)}
        phoneE164={phoneE164}
        mode="visit"
        title="Reserva de visita"
        introLine="Hola, quiero reservar una visita para tomar medidas."
        fields={visitFields}
        submitLabel="Abrir WhatsApp para reservar"
        draftKey="visit:global"
        onSubmitTrack={() => track("booking_open_intent", { mode: "visit", service: "global", context: "contact" })}
      />
    </ContactWhatsAppContext.Provider>
  );
}

export function ContactWhatsAppButton({ children, className }: { children: ReactNode; className?: string }) {
  const { openQuick } = useContactWhatsApp();
  return <Button className={className} onClick={openQuick}>{children}</Button>;
}

export function ContactActions() {
  const { openQuick, openVisit } = useContactWhatsApp();
  return (
    <div id="contacto-canales" className="mt-8 scroll-mt-28">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button onClick={openQuick} className="!border-[#F97316] !bg-[#F97316] !text-[#111315] hover:!bg-[#EA580C]">WhatsApp rápido</Button>
        <Button variant="secondary" onClick={openVisit} className="!border-slate-300 !bg-white !text-slate-900 hover:!border-[#F97316]">Concertar visita</Button>
      </div>
    </div>
  );
}

export function ContactMap({ address, mapsUrl }: { address: string; mapsUrl: string }) {
  const [showMap, setShowMap] = useState(false);
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:min-h-[330px]">
      {showMap ? (
        <iframe
          src={embedUrl}
          title={`Mapa de Google Maps: ${address}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="min-h-[280px] w-full flex-1 border-0 sm:min-h-[330px]"
          allowFullScreen
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-7 text-center">
          <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full border border-[#F97316]/30 bg-[#F97316]/10 text-3xl text-[#EA580C]">⌖</span>
          <p className="mt-4 text-lg font-extrabold text-slate-900">Aquí está nuestro taller</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">{address}</p>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-500">El mapa de Google se carga solo si lo solicitas. Google puede tratar datos de navegación al cargarlo.</p>
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#F97316] px-5 py-3 text-sm font-bold text-[#111315] transition-colors hover:bg-[#EA580C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
          >
            Mostrar mapa de Google
          </button>
        </div>
      )}
      <div className="border-t border-slate-200 bg-white px-4 py-3 text-center">
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#C2410C] underline underline-offset-2 hover:text-[#9A3412]">Abrir ubicación oficial en Google Maps</a>
      </div>
    </div>
  );
}
