"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";
import type { Business } from "@/lib/pagejson.types";
import { track, trackLinkClick } from "@/lib/analytics";
import { addLead } from "@/lib/leads";
import { getServiceLabel, SERVICE_SLUGS } from "@/lib/servicePages";
import WhatsAppQuickModal from "@/components/WhatsAppQuickModal";
import { getWhatsAppQuickFields } from "@/lib/whatsappQuickFields";
import { getLandingContextFromPathname } from "@/lib/landingContext";

function toTelUrl(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

function IconWhatsApp() {
  // Icono genérico (no exacto de marca)
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

function IconPin() {
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
      <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z" />
      <path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    </svg>
  );
}

type MenuItem = { label: string; href: string };

type ServiceItem = { label: string; href: string };

const SERVICES: ServiceItem[] = [
  { label: "Soldadura", href: "/servicios/soldadura" },
  { label: "Carpintería metálica a medida", href: "/servicios/carpinteria-metalica-a-medida" },
  { label: "Puertas, rejas y cerramientos", href: "/servicios/puertas-rejas-cerramientos" },
  { label: "Estructuras metálicas", href: "/servicios/estructuras-metalicas" },
  { label: "Montajes industriales", href: "/servicios/montajes-industriales" },
  { label: "Inox", href: "/servicios/inox" },
  { label: "Techos y cubiertas", href: "/servicios/techos-cubiertas" },
  { label: "Panel sándwich", href: "/servicios/panel-sandwich" },
  { label: "Cerramientos industriales", href: "/servicios/cerramientos-paramentos-industriales" },
  { label: "Cerraduras y refuerzos", href: "/servicios/cerraduras-refuerzos" },
  { label: "Escaleras metálicas", href: "/servicios/escaleras-metalicas" }
];

export default function SiteHeader({ business }: { business?: Business }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [servicesDismissed, setServicesDismissed] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  const dismissServices = () => {
    setServicesOpen(false);
    setServicesDismissed(true);
    // Evita que `:focus` mantenga el dropdown abierto tras navegar.
    if (typeof document !== "undefined") {
      (document.activeElement as HTMLElement | null)?.blur?.();
    }
  };

  // Cierra menús al navegar entre páginas.
  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
    setServicesDismissed(false);
  }, [pathname]);

  const b = business;
  const phone = b?.phone ?? "+34 624 356 893";

  const serviceSlug = useMemo(() => {
    if (!pathname) return undefined;
    if (pathname.startsWith("/servicios/")) return pathname.split("/")[2];
    // Landings: /{location}/{service}
    const ctx = getLandingContextFromPathname(pathname);
    if (ctx) return ctx.serviceSlug;
    return undefined;
  }, [pathname]);

  const serviceLabel = serviceSlug ? getServiceLabel(serviceSlug) ?? undefined : undefined;

  const locationPrefill = useMemo(() => {
    const ctx = getLandingContextFromPathname(pathname);
    if (!ctx) return undefined;
    return { localidad: ctx.locationLabel } as Record<string, string>;
  }, [pathname]);

  const quickFields = useMemo(() => getWhatsAppQuickFields(serviceSlug, serviceLabel), [serviceSlug, serviceLabel]);

  const quickTitle = serviceLabel ? `WhatsApp — ${serviceLabel}` : "WhatsApp";
  const quickIntro = serviceLabel ? `Hola, quiero presupuesto de: ${serviceLabel}.` : "Hola, quiero pedir un presupuesto.";

  const navItems = useMemo<MenuItem[]>(
    () => [
      { label: "Inicio", href: "/" },
      { label: "Servicios", href: "/servicios" },
      { label: "Trabajos", href: "/trabajos" },
      { label: "Opiniones", href: "/opiniones" },
      { label: "Preguntas", href: "/preguntas-frecuentes" },
      { label: "Contacto", href: "/contacto" }
    ],
    []
  );

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const desktopLinkBase =
    "relative inline-flex items-center h-10 px-1 text-sm leading-none transition-opacity duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-md after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-1 after:h-[2px] after:bg-brand after:transition-transform after:duration-200 after:origin-left";

  const desktopLinkClass = (href: string) =>
    `${desktopLinkBase} ${
      isActive(href)
        ? "opacity-100 after:scale-x-100"
        : "opacity-80 hover:opacity-100 after:scale-x-0 hover:after:scale-x-100"
    }`;

  const mobileLinkBase =
    "relative rounded-xl px-3 py-2 text-sm transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 after:content-[''] after:absolute after:left-3 after:right-3 after:bottom-1 after:h-[2px] after:bg-brand after:transition-transform after:duration-200 after:origin-left";

  const mobileLinkClass = (href: string) =>
    `${mobileLinkBase} ${
      isActive(href)
        ? "opacity-100 bg-brand/10 after:scale-x-100"
        : "opacity-90 hover:opacity-100 hover:bg-brand/5 after:scale-x-0 hover:after:scale-x-100"
    }`;

  return (
    <>
      {/*
        Usamos `fixed` (en lugar de `sticky`) para garantizar que el header no
        “desaparezca” al hacer scroll en ciertos layouts/navegadores.
      */}
      {/*
        IMPORTANT: do not use `overflow-hidden` on the fixed header.
        The desktop “Servicios” dropdown is absolutely positioned and would be clipped.
      */}
      <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div aria-hidden="true" className="h-1 w-full bg-gradient-to-r from-accent via-brand to-accent" />
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-3 py-3">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" aria-label="Ir a inicio" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt={b?.name ?? "DBM"}
                width={160}
                height={160}
                className="h-[104px] w-[104px] md:h-[160px] md:w-[160px]"
                priority
              />
            </Link>
          </div>

          {/* Center: Nav */}
          <nav className="hidden md:flex items-center justify-center gap-5">
            {navItems.map((i) =>
              i.label !== "Servicios" ? (
                <Link
                  key={i.href}
                  href={i.href}
                  className={desktopLinkClass(i.href)}
                  aria-current={isActive(i.href) ? "page" : undefined}
                >
                  {i.label}
                </Link>
              ) : (
                <div
                  key={i.href}
                  className="relative"
                  onMouseEnter={() => {
                    if (!servicesDismissed) setServicesOpen(true);
                  }}
                  onMouseLeave={() => {
                    setServicesOpen(false);
                    setServicesDismissed(false);
                  }}
                  onFocusCapture={() => {
                    if (!servicesDismissed) setServicesOpen(true);
                  }}
                >
                  <Link
                    href={i.href}
                    className={desktopLinkClass(i.href)}
                    aria-current={isActive(i.href) ? "page" : undefined}
                    onClick={dismissServices}
                  >
                    Servicios
                  </Link>

                  {/* Dropdown (desktop): animación sutil (fade + slide) */}
                  <div
                    aria-hidden={!servicesOpen}
                    className={
                      "absolute left-1/2 -translate-x-1/2 top-full w-80 pt-3 z-50 transition-all duration-150 ease-out motion-reduce:transition-none motion-reduce:transform-none " +
                      (servicesOpen
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 -translate-y-1 pointer-events-none")
                    }
                  >
                    <div className="rounded-2xl border border-border bg-white shadow-sm p-2">
                      <Link
                        href="/servicios"
                        tabIndex={servicesOpen ? 0 : -1}
                        className="block rounded-xl px-3 py-2 text-sm opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                        onClick={dismissServices}
                      >
                        Ver todos los servicios
                      </Link>
                      <div className="my-2 h-px bg-slate-200" />
                      <div className="grid grid-cols-1">
                        {SERVICES.map((s) => (
                          <Link
                            key={s.href}
                            href={s.href}
                            tabIndex={servicesOpen ? 0 : -1}
                            className="rounded-xl px-3 py-2 text-sm opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                            onClick={dismissServices}
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center justify-end gap-3">
            {b?.googleProfileUrl ? (
              <a
                className="text-sm opacity-80 hover:opacity-100 transition-opacity duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-md"
                href={b.googleProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLinkClick({ href: b.googleProfileUrl!, label: "Google", context: "header" })}
              >
                Google
              </a>
            ) : null}

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-border border-[#25D366]/30 bg-[#25D366] text-white transition-all duration-150 ease-out hover:bg-[#1EBE5D] hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              onClick={() => {
                setQuickOpen(true);
                trackLinkClick({ href: "whatsapp_modal", label: "WhatsApp", context: "header" });
                track("whatsapp_quick_open", { mode: "quick", service: serviceSlug ?? "global", context: "header" });
              }}
            >
              WhatsApp
            </button>

            <a
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-border transition-all duration-150 ease-out hover:bg-brand/5 hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              href={toTelUrl(phone)}
              onClick={() => trackLinkClick({ href: toTelUrl(phone), label: "Llamar", context: "header" })}
            >
              Llamar
            </a>
          </div>

          {/* Mobile: Actions */}
          <div className="md:hidden flex items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 font-medium border border-border border-[#25D366]/30 bg-[#25D366] text-white transition-all duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              aria-label="Abrir WhatsApp"
              onClick={() => {
                setQuickOpen(true);
                trackLinkClick({ href: "whatsapp_modal", label: "WhatsApp", context: "header_mobile" });
                track("whatsapp_quick_open", { mode: "quick", service: serviceSlug ?? "global", context: "header_mobile" });
              }}
            >
              <IconWhatsApp />
              <span className="sr-only">WhatsApp</span>
            </button>

            <a
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 font-medium border border-border transition-all duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              href={toTelUrl(phone)}
              aria-label="Llamar"
              onClick={() => trackLinkClick({ href: toTelUrl(phone), label: "Llamar", context: "header_mobile" })}
            >
              <IconPhone />
              <span className="sr-only">Llamar</span>
            </a>

            {b?.mapsUrl || b?.googleProfileUrl ? (
              <a
                className="inline-flex items-center justify-center rounded-xl px-3 py-2 font-medium border border-border transition-all duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                href={(b?.mapsUrl ?? b?.googleProfileUrl)!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver en Google Maps"
                onClick={() =>
                  trackLinkClick({
                    href: (b?.mapsUrl ?? b?.googleProfileUrl)!,
                    label: "Google",
                    context: "header_mobile"
                  })
                }
              >
                <IconPin />
                <span className="sr-only">Google Maps</span>
              </a>
            ) : null}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 border border-border transition-all duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              Menú
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen ? (
          <div className="md:hidden pb-4">
            <div className="grid gap-2 rounded-2xl border border-border p-3 bg-white">
              {navItems.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className={mobileLinkClass(i.href)}
                  aria-current={isActive(i.href) ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {i.label}
                </Link>
              ))}

              <div className="mt-1 rounded-xl border border-border p-2">
                <p className="px-1 py-1 text-xs font-semibold opacity-70">Servicios</p>
                <div className="grid gap-1">
                  {SERVICES.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="rounded-xl px-3 py-2 text-sm opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>

              {b?.mapsUrl ? (
                <a
                  className="rounded-xl px-3 py-2 text-sm opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  href={b.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                >
                  Cómo llegar
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
        </Container>
      </header>

      {/* Spacer para que el contenido no quede oculto bajo el header fijo */}
      <div aria-hidden className="h-[136px] md:h-[192px]" />

      <WhatsAppQuickModal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        phoneE164={phone}
        mode="quick"
        title={quickTitle}
        introLine={quickIntro}
        fields={quickFields}
        prefill={locationPrefill}
        workLabel={serviceLabel}
        submitLabel="Abrir WhatsApp con el mensaje"
        draftKey={serviceSlug ? `header_quick:${serviceSlug}` : "header_quick:global"}
        onSubmitTrack={() => {
          addLead({
            source: "header",
            service: serviceLabel ?? undefined,
            location: (locationPrefill as any)?.localidad ?? undefined,
            meta: { channel: "whatsapp", service: serviceSlug }
          });
          track("whatsapp_quick_send", { mode: "quick", service: serviceSlug ?? "global", context: "header" });
        }}
      />
    </>
  );
}
