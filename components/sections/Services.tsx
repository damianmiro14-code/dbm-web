"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import ImageGridLightbox from "@/components/ui/ImageGridLightbox";
import WhatsAppSpecModal from "@/components/WhatsAppSpecModal";
import WhatsAppQuickModal from "@/components/WhatsAppQuickModal";
import type { ServicesSection } from "@/lib/pagejson.types";
import { track } from "@/lib/analytics";
import { addLead } from "@/lib/leads";
import { getServiceLabel, getServiceRaw } from "@/lib/servicePages";
import { getWhatsAppSpecFields } from "@/lib/whatsappSpecSchemas";
import { getVisitFields, getWhatsAppQuickFields } from "@/lib/whatsappQuickFields";

const DEFAULT_WA_PHONE = "+34624356893";

const TRUST_CHIPS = [
  "Castellón y provincia",
  "Fabricación + instalación",
  "Respuesta rápida por WhatsApp",
] as const;

function getServiceSlugFromHref(href?: string): string | undefined {
  if (!href) return undefined;
  const parts = href.split("/").filter(Boolean);
  if (parts.length === 2 && parts[0] === "servicios") return parts[1];
  return undefined;
}

export default function Services({ section }: { section: ServicesSection }) {
  const pathname = usePathname();
  const isServiciosHub = pathname === "/servicios";

  const [specOpen, setSpecOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [activeServiceSlug, setActiveServiceSlug] = useState<string | undefined>(undefined);

  // Single-open accordion on /servicios.
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const activeServiceLabel = useMemo(() => {
    if (!activeServiceSlug) return undefined;
    return getServiceLabel(activeServiceSlug) ?? undefined;
  }, [activeServiceSlug]);

  const activeFields = useMemo(() => {
    return getWhatsAppSpecFields(activeServiceSlug, activeServiceLabel);
  }, [activeServiceSlug, activeServiceLabel]);

  const quickFields = useMemo(
    () => getWhatsAppQuickFields(activeServiceSlug, activeServiceLabel),
    [activeServiceSlug, activeServiceLabel]
  );

  const visitFields = useMemo(() => getVisitFields(activeServiceLabel), [activeServiceLabel]);

  const serviceThumbBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const it of section.items) {
      const slug = getServiceSlugFromHref(it.href);
      if (!slug || map.has(slug)) continue;
      try {
        const raw = getServiceRaw(slug) as any;
        const sections = Array.isArray(raw?.sections) ? raw.sections : [];
        const gallery = sections.find((s: any) => s?.type === "gallery" && Array.isArray(s?.images));
        const first = gallery?.images?.[0]?.src;
        if (typeof first === "string" && first.startsWith("/")) map.set(slug, first);
      } catch {
        // ignore
      }
    }
    return map;
  }, [section.items]);

  const servicePreviewImagesBySlug = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const it of section.items) {
      const slug = getServiceSlugFromHref(it.href);
      if (!slug || map.has(slug)) continue;
      try {
        const raw = getServiceRaw(slug) as any;
        const sections = Array.isArray(raw?.sections) ? raw.sections : [];
        const gallery = sections.find((s: any) => s?.type === "gallery" && Array.isArray(s?.images));
        const imgs = (gallery?.images ?? [])
          .map((x: any) => x?.src)
          .filter((s: any) => typeof s === "string" && s.startsWith("/")) as string[];
        if (imgs.length) map.set(slug, imgs.slice(0, 3));
      } catch {
        // ignore
      }
    }
    return map;
  }, [section.items]);

  // On the /servicios hub we prefer an accordion ("menú desplegable") for faster scanning on mobile.
  // Other pages keep the card grid.
  const renderServiciosHubAccordion = () => {
    return (
      <div className="mt-8 space-y-3 max-w-4xl mx-auto">
        {section.items.map((it) => {
          const slug = getServiceSlugFromHref(it.href);
          const isOpen = !!slug && openSlug === slug;
          const thumb = slug ? serviceThumbBySlug.get(slug) : undefined;
          const preview = slug ? servicePreviewImagesBySlug.get(slug) : undefined;
          const key = slug ?? it.href ?? it.title;

          return (
            <div
              key={key}
              className={
                "rounded-2xl border bg-white shadow-sm transition-all duration-200 " +
                (isOpen
                  ? "border-brand/30 shadow-md bg-gradient-to-br from-white to-brand/5"
                  : "border-border hover:shadow-md hover:-translate-y-0.5")
              }
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={slug ? `svc-${slug}` : undefined}
                className="group flex w-full items-center justify-between gap-4 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                onClick={() => {
                  if (!slug) return;
                  setOpenSlug((prev) => (prev === slug ? null : slug));
                }}
              >
                <div className="min-w-0">
                  <h3 className="text-base font-semibold md:text-lg">{it.title}</h3>
                  <ul className="mt-2 flex flex-wrap gap-2" aria-label="Ventajas">
                    {TRUST_CHIPS.map((c) => (
                      <li
                        key={c}
                        className="rounded-full border border-brand/20 bg-brand/5 px-2.5 py-1 text-xs font-medium text-slate-900"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                  {it.tags?.length ? (
                    <p className="mt-1 text-sm opacity-70">{it.tags.slice(0, 3).join(" · ")}</p>
                  ) : null}
                  {/* Avoid duplicated text: show the one-line summary only when closed. */}
                  {!isOpen && it.description ? (
                    <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm opacity-75">
                      {it.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  {thumb ? (
                    <div className="relative hidden h-12 w-20 overflow-hidden rounded-xl border border-border bg-section/40 sm:block">
                      <Image
                        src={thumb}
                        alt={it.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <span
                    aria-hidden="true"
                    className={
                      "shrink-0 rounded-full border border-border bg-section/60 p-2 text-brand transition-transform duration-200 " +
                      (isOpen ? "rotate-180" : "")
                    }
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </button>

              <div
                id={slug ? `svc-${slug}` : undefined}
                className={
                  "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none " +
                  (isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
                }
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 pt-1">
                    <p className="opacity-80">{it.description}</p>

                    {preview?.length ? (
                      <div className="mt-4">
                        <ImageGridLightbox
                          images={preview.map((src, idx) => ({
                            src,
                            alt: `${it.title} — foto ${idx + 1}`,
                          }))}
                          colsClassName="grid-cols-2 md:grid-cols-3"
                          thumbAspectClassName="aspect-[4/3]"
                          enableNavigation
                          showCounter
                        />
                      </div>
                    ) : null}

                    {it.tags?.length ? (
                      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Etiquetas">
                        {it.tags.map((t) => (
                          <li
                            key={t}
                            className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-sm text-slate-900"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-3">
                      {slug ? (
                        <>
                          <Button
                            onClick={() => {
                              setActiveServiceSlug(slug);
                              setQuickOpen(true);
                              track("whatsapp_quick_open", {
                                mode: "quick",
                                service: slug,
                                context: "servicios_hub"
                              });
                            }}
                          >
                            WhatsApp rápido
                          </Button>

                          <Button
                            variant="secondary"
                            onClick={() => {
                              setActiveServiceSlug(slug);
                              setVisitOpen(true);
                              track("booking_open", { mode: "visit", service: slug, context: "servicios_hub" });
                            }}
                          >
                            Reservar visita
                          </Button>

                          <Button
                            variant="secondary"
                            onClick={() => {
                              setActiveServiceSlug(slug);
                              setSpecOpen(true);
                              track("service_spec_open", { mode: "spec", service: slug, context: "servicios_hub" });
                            }}
                          >
                            Especificar mi trabajo
                          </Button>
                        </>
                      ) : null}

                      {it.href ? (
                        <Button variant="secondary" href={it.href}>
                          Ver detalles
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section
      id={section.id}
      aria-label={section.title}
      className={isServiciosHub ? "bg-gradient-to-b from-section/70 to-transparent" : undefined}
    >
      <Container>
        <div className="py-14 md:py-20">
          <SectionHeader title={section.title} subtitle={section.subtitle} />

          {isServiciosHub ? (
            renderServiciosHubAccordion()
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {section.items.map((it) => {
                const slug = getServiceSlugFromHref(it.href);
                const key = slug ?? it.href ?? it.title;
                const card = (
                  <>
                    <h3 className="text-lg font-semibold">{it.title}</h3>
                    <p className="mt-2 opacity-80">{it.description}</p>
                    {it.tags?.length ? (
                      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Etiquetas">
                        {it.tags.map((t) => (
                          <li
                            key={t}
                            className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-sm text-slate-900"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                );

                if (it.href) {
                  return (
                    <Link
                      key={key}
                      href={it.href}
                      className="group block rounded-2xl border border-border bg-white p-6 transition-all duration-200 ease-out hover:bg-brand/5 hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:shadow-sm active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 motion-reduce:transition-none"
                    >
                      {card}
                    </Link>
                  );
                }

                return (
                  <article key={key} className="rounded-2xl border border-border bg-white p-6">
                    {card}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </Container>

      <WhatsAppSpecModal
        open={specOpen}
        onClose={() => setSpecOpen(false)}
        phoneE164={DEFAULT_WA_PHONE}
        serviceLabel={activeServiceLabel}
        serviceSlug={activeServiceSlug}
        fields={activeFields}
        onSubmitTrack={() => {
          if (activeServiceSlug) {
            addLead({ source: "service_spec", meta: { service: activeServiceSlug, channel: "whatsapp" } });
            track("service_spec_send", { mode: "spec", service: activeServiceSlug, context: "servicios_hub" });
          }
        }}
      />

      <WhatsAppQuickModal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        phoneE164={DEFAULT_WA_PHONE}
        mode="quick"
        title={activeServiceLabel ? `WhatsApp rápido — ${activeServiceLabel}` : "WhatsApp rápido"}
        introLine={
          activeServiceLabel
            ? `Hola, quiero presupuesto de: ${activeServiceLabel}.`
            : "Hola, quiero pedir un presupuesto."
        }
        fields={quickFields}
        workLabel={activeServiceLabel}
        submitLabel="Abrir WhatsApp con el mensaje"
        draftKey={activeServiceSlug ? `quick:${activeServiceSlug}` : "quick:global"}
        onSubmitTrack={() => {
          addLead({ source: "contacto", meta: { channel: "whatsapp", service: activeServiceSlug } });
          track("whatsapp_quick_send", {
            mode: "quick",
            service: activeServiceSlug ?? "global",
            context: "servicios_hub"
          });
        }}
      />

      <WhatsAppQuickModal
        open={visitOpen}
        onClose={() => setVisitOpen(false)}
        phoneE164={DEFAULT_WA_PHONE}
        mode="visit"
        title={activeServiceLabel ? `Reserva de visita — ${activeServiceLabel}` : "Reserva de visita"}
        introLine={
          activeServiceLabel
            ? `Hola, quiero reservar una visita para: ${activeServiceLabel}.`
            : "Hola, quiero reservar una visita para tomar medidas."
        }
        fields={visitFields}
        workLabel={activeServiceLabel}
        submitLabel="Abrir WhatsApp para reservar"
        draftKey={activeServiceSlug ? `visit:${activeServiceSlug}` : "visit:global"}
        onSubmitTrack={() => {
          addLead({ source: "reserva", meta: { channel: "whatsapp", service: activeServiceSlug } });
          track("booking_send", {
            mode: "visit",
            service: activeServiceSlug ?? "global",
            context: "servicios_hub"
          });
        }}
      />
    </section>
  );
}
