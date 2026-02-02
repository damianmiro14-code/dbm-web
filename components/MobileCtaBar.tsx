"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { Business } from "@/lib/pagejson.types";
import { trackLinkClick } from "@/lib/analytics";
import { getServiceLabel, SERVICE_SLUGS } from "@/lib/servicePages";
import { getQuickWhatsAppMessage } from "@/lib/whatsappQuickMessages";
import { getLandingContextFromPathname } from "@/lib/landingContext";

function toWhatsAppUrl(phoneE164: string, text: string) {
  const normalized = phoneE164.replace(/\s+/g, "");
  const phone = normalized.startsWith("+") ? normalized.slice(1) : normalized;
  const params = new URLSearchParams({ text });
  return `https://wa.me/${phone}?${params.toString()}`;
}

function toTelUrl(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

function IconWhatsApp() {
  // Simple WhatsApp-like bubble icon (generic, not brand exact)
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.3-4.9A8.5 8.5 0 1 1 21 11.5Z" />
      <path d="M9.2 9.4c.5 1.8 2 3.3 3.8 3.8" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 6.2 2 2 0 0 1 5.1 4h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.7 2.6a2 2 0 0 1-.5 2.2L9.5 11.3a16 16 0 0 0 3.2 3.2l.8-.8a2 2 0 0 1 2.2-.5c.8.4 1.7.6 2.6.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

export default function MobileCtaBar({ business }: { business?: Business }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const phone = business?.phone ?? "+34 624 356 893";

  const serviceSlug = useMemo(() => {
    if (!pathname) return undefined;
    if (pathname.startsWith("/servicios/")) return pathname.split("/")[2];
    const ctx = getLandingContextFromPathname(pathname);
    if (ctx) return ctx.serviceSlug;
    return undefined;
  }, [pathname]);

  const serviceLabel = serviceSlug ? getServiceLabel(serviceSlug) ?? undefined : undefined;

  const waText = serviceSlug
    ? getQuickWhatsAppMessage(serviceSlug, serviceLabel)
    : "Hola, soy ___ y necesito presupuesto para un trabajo de carpintería metálica en Castellón. Puedo enviar fotos y medidas.";
  const waUrl = toWhatsAppUrl(phone, waText);

  // Floating CTA (mobile only). Keeps the page open and opens WhatsApp in a new tab.
  return (
    <div
      className={
        "md:hidden fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 " +
        "pb-[env(safe-area-inset-bottom)] pointer-events-none"
      }
    >
      <div
        className={
          "pointer-events-auto transition-all duration-200 ease-out motion-reduce:transition-none " +
          (mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")
        }
      >
        <a
          className={
            "group inline-flex items-center gap-2 rounded-full px-5 py-3 font-medium " +
            "border border-border border-[#25D366]/30 bg-[#25D366] text-white shadow-sm transition-all duration-150 ease-out " +
            "hover:bg-[#1EBE5D] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] " +
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          }
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir WhatsApp"
          onClick={() => trackLinkClick({ href: waUrl, label: "WhatsApp", context: "floating_cta" })}
        >
          <IconWhatsApp />
          <span>WhatsApp</span>
        </a>
      </div>

      <div
        className={
          "pointer-events-auto transition-all duration-200 ease-out motion-reduce:transition-none " +
          (mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")
        }
      >
        <a
          className={
            "inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium " +
            "border border-border bg-white/90 backdrop-blur shadow-sm transition-all duration-150 ease-out " +
            "hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] " +
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          }
          href={toTelUrl(phone)}
          aria-label="Llamar"
          onClick={() => trackLinkClick({ href: toTelUrl(phone), label: "Llamar", context: "floating_cta" })}
        >
          <IconPhone />
          <span>Llamar</span>
        </a>
      </div>
    </div>
  );
}
