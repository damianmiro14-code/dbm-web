"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";
import type { Business } from "@/lib/pagejson.types";
import { track, trackLinkClick } from "@/lib/analytics";
import { addLead } from "@/lib/leads";
import { getServiceLabel } from "@/lib/servicePages";
import WhatsAppQuickModal from "@/components/WhatsAppQuickModal";
import { getWhatsAppQuickFields } from "@/lib/whatsappQuickFields";
import { getLandingContextFromPathname } from "@/lib/landingContext";

function IconWhatsApp() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.48-.883-.787-1.48-1.76-1.653-2.058-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.15-.173.2-.297.298-.495.099-.198.05-.372-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.875 1.213 3.073c.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.693.626.712.227 1.36.195 1.872.118.571-.085 1.758-.718 2.006-1.412.248-.694.248-1.288.173-1.412-.074-.124-.272-.198-.57-.347m-5.421 7.592h-.003a9.84 9.84 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.646-.235-.374a9.83 9.83 0 0 1-1.511-5.249c.002-5.431 4.424-9.852 9.857-9.852a9.788 9.788 0 0 1 6.972 2.889 9.788 9.788 0 0 1 2.882 6.977c-.003 5.432-4.425 9.853-9.853 9.853m8.386-18.227A11.816 11.816 0 0 0 12.047.248C5.518.248.206 5.559.203 12.086a11.8 11.8 0 0 0 1.58 5.903L.103 24l6.15-1.614a11.89 11.89 0 0 0 5.79 1.474h.005c6.527 0 11.838-5.312 11.841-11.84a11.79 11.79 0 0 0-3.452-8.375Z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 6.2 2 2 0 0 1 5.1 4h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.7 2.6a2 2 0 0 1-.5 2.2L9.5 11.3a16 16 0 0 0 3.2 3.2l.8-.8a2 2 0 0 1 2.2-.5c.8.4 1.7.6 2.6.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z" />
      <path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    </svg>
  );
}

function IconMenu({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {open ? <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
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

const NAV_ITEMS: MenuItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/servicios" },
  { label: "Trabajos", href: "/trabajos" },
  { label: "Opiniones", href: "/opiniones" },
  { label: "Preguntas", href: "/preguntas-frecuentes" },
  { label: "Contacto", href: "/contacto" }
];

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function SiteHeader({ business }: { business?: Business }) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const desktopServicesRef = useRef<HTMLAnchorElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [servicesDismissed, setServicesDismissed] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  const b = business;
  const phone = b?.phone ?? "+34 624 356 893";
  const callHref = "tel:+34624356893";
  const mapsHref = b?.mapsUrl ?? b?.googleProfileUrl;

  const dismissServices = () => {
    setServicesOpen(false);
    setServicesDismissed(true);
  };

  const closeMobileMenu = (restoreFocus = false) => {
    setMenuOpen(false);
    setMobileServicesOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  useEffect(() => {
    setMenuOpen(false);
    setMobileServicesOpen(false);
    setServicesOpen(false);
    setServicesDismissed(false);
  }, [pathname]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof window === "undefined") return;
    const setVar = () => document.documentElement.style.setProperty("--site-header-h", `${Math.ceil(el.getBoundingClientRect().height)}px`);
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    window.addEventListener("resize", setVar);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setVar);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen || typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFirst = window.requestAnimationFrame(() => {
      mobileMenuRef.current?.querySelector<HTMLElement>("[data-menu-first]")?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu(true);
        return;
      }
      if (event.key !== "Tab") return;
      const panelItems = Array.from(mobileMenuRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      const trigger = menuButtonRef.current;
      const first = panelItems[0];
      const last = panelItems[panelItems.length - 1];
      if (!trigger || !first || !last) return;
      if (event.shiftKey && document.activeElement === trigger) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === trigger) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        trigger.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        trigger.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFirst);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const serviceSlug = useMemo(() => {
    if (!pathname) return undefined;
    if (pathname.startsWith("/servicios/")) return pathname.split("/")[2];
    return getLandingContextFromPathname(pathname)?.serviceSlug;
  }, [pathname]);

  const serviceLabel = serviceSlug ? getServiceLabel(serviceSlug) ?? undefined : undefined;
  const locationPrefill = useMemo(() => {
    const ctx = getLandingContextFromPathname(pathname);
    return ctx ? ({ localidad: ctx.locationLabel } as Record<string, string>) : undefined;
  }, [pathname]);
  const quickFields = useMemo(() => getWhatsAppQuickFields(serviceSlug, serviceLabel), [serviceSlug, serviceLabel]);
  const quickTitle = serviceLabel ? `WhatsApp — ${serviceLabel}` : "WhatsApp";
  const quickIntro = serviceLabel ? `Hola, quiero presupuesto de: ${serviceLabel}.` : "Hola, quiero pedir un presupuesto.";

  const isActive = (href: string) => href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href));
  const desktopLinkClass = (href: string) =>
    `relative inline-flex h-11 items-center whitespace-nowrap px-1 text-[13px] font-medium text-white transition-colors after:absolute after:inset-x-1 after:bottom-1 after:h-0.5 after:bg-[#ff4b18] after:transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b18] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1112] ${isActive(href) ? "text-[#ff6536] after:scale-x-100" : "text-white/80 hover:text-white after:scale-x-0 hover:after:scale-x-100"}`;
  const mobileLinkClass = (href: string) =>
    `flex min-h-11 items-center border-b border-white/10 px-3 py-2.5 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff4b18] ${isActive(href) ? "text-[#ff6536]" : "text-white hover:bg-white/5"}`;

  const openQuickWhatsApp = (context: "header" | "header_mobile") => {
    setQuickOpen(true);
    trackLinkClick({ href: "whatsapp_modal", label: "WhatsApp", context });
    track("whatsapp_quick_open", { mode: "quick", service: serviceSlug ?? "global", context });
  };

  const trackMaps = (context: string) => {
    if (!mapsHref) return;
    trackLinkClick({ href: mapsHref, label: "Google Maps", context });
    if (!b?.mapsUrl) track("click_maps", { href: mapsHref, kind: "maps_fallback", label: "Google Maps", context });
  };

  const trackCall = (context: "header" | "header_mobile") => {
    trackLinkClick({ href: callHref, label: "Llamar", context });
  };

  return (
    <>
      <header ref={headerRef} className="fixed inset-x-0 top-0 z-[100] w-full border-b border-white/10 bg-[#0d1112]/[0.98] text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur">
        <div aria-hidden="true" className="h-1 w-full bg-[#ff4b18]" />
        <Container>
          <div className="flex h-[68px] items-center justify-between gap-3 lg:h-[66px]">
            <Link href="/" aria-label="DBM Carpintería Metálica, ir a inicio" onClick={() => closeMobileMenu()} className="flex min-w-0 items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b18] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1112]">
              <Image src="/logo.png" alt="" width={52} height={52} className="h-[50px] w-[50px] shrink-0 object-contain min-[400px]:h-[52px] min-[400px]:w-[52px] lg:h-[50px] lg:w-[50px]" priority />
              <span className="min-w-0 leading-none">
                <span className="block text-[19px] font-black tracking-[0.08em] text-white min-[400px]:text-xl lg:text-[19px]">DBM</span>
                <span className="mt-1 block whitespace-nowrap text-[8px] font-semibold tracking-[0.18em] text-white/80 lg:text-[8px]">CARPINTERÍA METÁLICA</span>
              </span>
            </Link>

            <nav aria-label="Navegación principal" className="hidden items-center justify-center gap-3 lg:flex xl:gap-5">
              {NAV_ITEMS.map((item) => item.label !== "Servicios" ? (
                <Link key={item.href} href={item.href} className={desktopLinkClass(item.href)} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</Link>
              ) : (
                <div key={item.href} className="relative" onMouseEnter={() => !servicesDismissed && setServicesOpen(true)} onMouseLeave={() => { setServicesOpen(false); setServicesDismissed(false); }} onFocusCapture={() => !servicesDismissed && setServicesOpen(true)} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); dismissServices(); desktopServicesRef.current?.focus(); } }}>
                  <Link ref={desktopServicesRef} href={item.href} className={desktopLinkClass(item.href)} aria-current={isActive(item.href) ? "page" : undefined} aria-haspopup="true" aria-expanded={servicesOpen} aria-controls="desktop-services-menu" onClick={dismissServices}>Servicios</Link>
                  <div id="desktop-services-menu" aria-hidden={!servicesOpen} className={`absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-2 transition-all duration-150 motion-reduce:transition-none ${servicesOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}>
                    <div className="rounded-xl border border-white/10 bg-[#111617] p-2 shadow-2xl">
                      <Link href="/servicios" tabIndex={servicesOpen ? 0 : -1} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#ff6536] hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b18]" onClick={dismissServices}>Ver todos los servicios</Link>
                      <div className="my-1 h-px bg-white/10" />
                      {SERVICES.map((service) => <Link key={service.href} href={service.href} tabIndex={servicesOpen ? 0 : -1} className="block rounded-lg px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b18]" onClick={dismissServices}>{service.label}</Link>)}
                    </div>
                  </div>
                </div>
              ))}
            </nav>

            <div className="hidden shrink-0 items-center justify-end gap-2 lg:flex">
              <a href={callHref} onClick={() => trackCall("header")} className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-white/85 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b18]" aria-label="Llamar al 624 356 893"><IconPhone /><span>Llamar</span></a>
              {mapsHref ? <a href={mapsHref} target="_blank" rel="noopener noreferrer" onClick={() => trackMaps("header")} className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs text-white/75 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b18]" aria-label="Cómo llegar con Google Maps"><IconPin /><span className="hidden xl:inline">Cómo llegar</span></a> : null}
              <button type="button" onClick={() => openQuickWhatsApp("header")} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#ff4b18] px-4 text-sm font-bold text-white transition-colors hover:bg-[#e83d0c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#ff4b18]"><IconWhatsApp />WhatsApp</button>
            </div>

            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <button type="button" onClick={() => openQuickWhatsApp("header_mobile")} className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[#ff4b18] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1112]" aria-label="Abrir WhatsApp"><IconWhatsApp /></button>
              <button ref={menuButtonRef} type="button" onClick={() => menuOpen ? closeMobileMenu(true) : setMenuOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/20 text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b18]" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="mobile-navigation"><IconMenu open={menuOpen} /></button>
            </div>
          </div>
        </Container>
      </header>

      {typeof document !== "undefined" && menuOpen ? createPortal(
        <div id="mobile-navigation" ref={mobileMenuRef} className="fixed inset-x-0 bottom-0 z-[90] bg-[#0d1112] text-white lg:hidden" style={{ top: "var(--site-header-h, 72px)" }}>
          <nav aria-label="Navegación móvil" className="mx-auto h-full w-full max-w-6xl overflow-y-auto overscroll-contain px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-3">
            <div className="mx-auto max-w-xl">
              {NAV_ITEMS.filter((item) => item.label === "Inicio").map((item) => <Link key={item.href} href={item.href} data-menu-first="true" className={mobileLinkClass(item.href)} aria-current={isActive(item.href) ? "page" : undefined} onClick={() => closeMobileMenu()}>{item.label}</Link>)}

              <div className="border-b border-white/10">
                <button type="button" className="flex min-h-11 w-full items-center justify-between px-3 py-2.5 text-left text-base text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff4b18]" aria-expanded={mobileServicesOpen} aria-controls="mobile-services-menu" onClick={() => setMobileServicesOpen((open) => !open)}><span>Servicios</span><span aria-hidden className={`text-[#ff6536] transition-transform ${mobileServicesOpen ? "rotate-45" : ""}`}>+</span></button>
                {mobileServicesOpen ? <div id="mobile-services-menu" className="mb-2 border-l-2 border-[#ff4b18] pl-2">
                  <Link href="/servicios" className="flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-semibold text-[#ff6536] hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b18]" onClick={() => closeMobileMenu()}>Ver todos los servicios</Link>
                  {SERVICES.map((service) => <Link key={service.href} href={service.href} className="flex min-h-11 items-center rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b18]" onClick={() => closeMobileMenu()}>{service.label}</Link>)}
                </div> : null}
              </div>

              {NAV_ITEMS.filter((item) => item.label !== "Inicio" && item.label !== "Servicios").map((item) => <Link key={item.href} href={item.href} className={mobileLinkClass(item.href)} aria-current={isActive(item.href) ? "page" : undefined} onClick={() => closeMobileMenu()}>{item.label}</Link>)}

              <div className="grid grid-cols-2 gap-3 py-4">
                <a href={callHref} onClick={() => { trackCall("header_mobile"); closeMobileMenu(); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/25 px-3 text-sm font-semibold text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b18]"><IconPhone />Llamar</a>
                {mapsHref ? <a href={mapsHref} target="_blank" rel="noopener noreferrer" onClick={() => { trackMaps("header_mobile"); closeMobileMenu(); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/25 px-3 text-sm font-semibold text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b18]"><IconPin />Maps</a> : <span />}
              </div>
              <button type="button" onClick={() => { closeMobileMenu(); openQuickWhatsApp("header_mobile"); }} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#ff4b18] px-4 text-sm font-bold text-white hover:bg-[#e83d0c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><IconWhatsApp />WhatsApp</button>
            </div>
          </nav>
        </div>,
        document.body
      ) : null}

      <div aria-hidden="true" style={{ height: "var(--site-header-h, 72px)" }} />

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
          addLead({ source: "header", service: serviceLabel ?? undefined, location: (locationPrefill as any)?.localidad ?? undefined, meta: { channel: "whatsapp", service: serviceSlug } });
          track("whatsapp_quick_send", { mode: "quick", service: serviceSlug ?? "global", context: "header" });
        }}
      />
    </>
  );
}
