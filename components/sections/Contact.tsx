"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import type { ContactSection } from "@/lib/pagejson.types";
import { track } from "@/lib/analytics";
import { addLead } from "@/lib/leads";
import WhatsAppSpecModal from "@/components/WhatsAppSpecModal";
import WhatsAppQuickModal from "@/components/WhatsAppQuickModal";
import { getServiceLabel, SERVICE_SLUGS } from "@/lib/servicePages";
import { getWhatsAppSpecFields } from "@/lib/whatsappSpecSchemas";
import { getVisitFields, getWhatsAppQuickFields } from "@/lib/whatsappQuickFields";
import { getLandingContextFromPathname } from "@/lib/landingContext";
import site from "@/content/es/site.json";
import SocialIcon from "@/components/ui/SocialIcon";

function toWhatsAppUrl(phoneE164: string, text: string) {
  const normalized = phoneE164.replace(/\s+/g, "");
  const phone = normalized.startsWith("+") ? normalized.substring(1) : normalized;
  const params = new URLSearchParams({ text });
  return `https://wa.me/${phone}?${params.toString()}`;
}

export default function Contact({ section }: { section: ContactSection }) {
  const pathname = usePathname();
  const [specOpen, setSpecOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);

  const serviceSlug = useMemo(() => {
    if (!pathname) return undefined;
    if (pathname.startsWith("/servicios/")) return pathname.split("/")[2];
    // Landings: /{location}/{service}
    const ctx = getLandingContextFromPathname(pathname);
    if (ctx) return ctx.serviceSlug;
    return undefined;
  }, [pathname]);

  const locationPrefill = useMemo(() => {
    const ctx = getLandingContextFromPathname(pathname);
    if (!ctx) return undefined;
    return { localidad: ctx.locationLabel } as Record<string, string>;
  }, [pathname]);

  const serviceLabel = serviceSlug ? getServiceLabel(serviceSlug) ?? undefined : undefined;

  const quickFields = useMemo(
    () => getWhatsAppQuickFields(serviceSlug, serviceLabel),
    [serviceSlug, serviceLabel]
  );

  const visitFields = useMemo(() => getVisitFields(serviceLabel), [serviceLabel]);

  const specFields = useMemo(
    () => getWhatsAppSpecFields(serviceSlug, serviceLabel),
    [serviceSlug, serviceLabel]
  );

  const socialLinks = useMemo(() => {
    if (section.socialLinks?.length) return section.socialLinks;
    const fallback = (site as any)?.business?.socialLinks;
    return Array.isArray(fallback) && fallback.length ? fallback : undefined;
  }, [section.socialLinks]);

  return (
    <section id={section.id} aria-label={section.title}>
      <Container>
        <div className="py-14 md:py-20">
          <SectionHeader title={section.title} subtitle={section.subtitle} />

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white p-6 transition-all duration-200 ease-out hover:shadow-md motion-reduce:transition-none">
              <h3 className="text-lg font-semibold">Como pedir presupuesto por WhatsApp</h3>
              <p className="mt-2 opacity-80">
                Envia un mensaje por WhatsApp y adjunta fotos si puedes. Es lo mas rapido.
              </p>
              <ul className="mt-4 grid gap-2 text-sm opacity-80 list-disc pl-5">
                <li>Localidad y ubicacion aproximada.</li>
                <li>Fotos del sitio o del trabajo.</li>
                <li>Medidas aproximadas (alto/ancho/largo) o plano.</li>
                <li>Material y acabado (hierro/inox, lacado/galvanizado, etc.).</li>
              </ul>
              <p className="mt-4 text-sm opacity-70">Respondemos el mismo dia en horario laboral.</p>
            </div>

            <aside className="rounded-2xl border border-border bg-white p-6 transition-all duration-200 ease-out hover:shadow-md motion-reduce:transition-none">
              <h3 className="text-lg font-semibold">Envia tu solicitud</h3>
              <p className="mt-2 opacity-80">
                Abrimos WhatsApp con un mensaje listo. Solo tienes que enviarlo.
              </p>

              {socialLinks?.length ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-60">Síguenos</span>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((l: any) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm hover:bg-section"
                        aria-label={l.label}
                        title={l.label}
                        onClick={() => track(`social_${String(l.platform ?? "link").toLowerCase()}_click`, { context: "contact" })}
                      >
                        <SocialIcon platform={l.platform} className="h-4 w-4" />
                        <span className="hidden sm:inline">{l.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                {section.whatsapp ? (
                  <Button
                    onClick={() => {
                      setQuickOpen(true);
                      track("whatsapp_quick_open", { mode: "quick", service: serviceSlug ?? "global", context: "contact" });
                    }}
                  >
                    {serviceSlug ? "WhatsApp rápido" : "WhatsApp"}
                  </Button>
                ) : null}

                {section.whatsapp ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setVisitOpen(true);
                      track("booking_open", { mode: "visit", service: serviceSlug ?? "global", context: "contact" });
                    }}
                  >
                    Reservar visita
                  </Button>
                ) : null}

                {section.whatsapp && serviceSlug ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSpecOpen(true);
                      track("service_spec_open", { mode: "spec", service: serviceSlug, context: "contact" });
                    }}
                  >
                    Especificar mi trabajo
                  </Button>
                ) : null}
                <Button variant="secondary" href="tel:+34624356893">
                  Llamar
                </Button>
              </div>

              <div className="mt-6 grid gap-2 text-sm opacity-80">
                <p>
                  <strong>Horario:</strong> L-V 07:00-20:00 · S 08:00-14:00
                </p>
                <p>
                  <strong>Zona:</strong> Castellon y alrededores (provincia de Castellon)
                </p>
                <p>
                  <strong>Nave:</strong> Atencion con cita previa
                </p>
              </div>
            </aside>
          </div>
        </div>
      </Container>

      {section.whatsapp && serviceSlug ? (
        <WhatsAppSpecModal
          open={specOpen}
          onClose={() => setSpecOpen(false)}
          phoneE164={section.whatsapp?.phoneE164 ?? "+34624356893"}
          serviceLabel={serviceLabel}
          serviceSlug={serviceSlug}
          prefill={locationPrefill}
          fields={specFields}
          onSubmitTrack={() => {
            addLead({ source: "service_spec", meta: { service: serviceSlug, channel: "whatsapp" } });
            track("service_spec_send", { mode: "spec", service: serviceSlug, context: "contact" });
          }}
        />
      ) : null}

      {section.whatsapp ? (
        <WhatsAppQuickModal
          open={quickOpen}
          onClose={() => setQuickOpen(false)}
          phoneE164={section.whatsapp.phoneE164}
          mode="quick"
          title={serviceLabel ? `WhatsApp rápido — ${serviceLabel}` : "WhatsApp rápido"}
          introLine={serviceLabel ? `Hola, quiero presupuesto de: ${serviceLabel}.` : "Hola, quiero pedir un presupuesto."}
          fields={quickFields}
          prefill={locationPrefill}
          workLabel={serviceLabel}
          submitLabel="Abrir WhatsApp con el mensaje"
          draftKey={serviceSlug ? `quick:${serviceSlug}` : "quick:global"}
          onSubmitTrack={() => {
            addLead({ source: "contacto", meta: { channel: "whatsapp", service: serviceSlug } });
            track("whatsapp_quick_send", { mode: "quick", service: serviceSlug ?? "global", context: "contact" });
          }}
        />
      ) : null}

      {section.whatsapp ? (
        <WhatsAppQuickModal
          open={visitOpen}
          onClose={() => setVisitOpen(false)}
          phoneE164={section.whatsapp.phoneE164}
          mode="visit"
          title={serviceLabel ? `Reserva de visita — ${serviceLabel}` : "Reserva de visita"}
          introLine={serviceLabel ? `Hola, quiero reservar una visita para: ${serviceLabel}.` : "Hola, quiero reservar una visita para tomar medidas."}
          fields={visitFields}
          prefill={locationPrefill}
          workLabel={serviceLabel}
          submitLabel="Abrir WhatsApp para reservar"
          draftKey={serviceSlug ? `visit:${serviceSlug}` : "visit:global"}
          onSubmitTrack={() => {
            addLead({ source: "reserva", meta: { channel: "whatsapp", service: serviceSlug } });
            track("booking_send", { mode: "visit", service: serviceSlug ?? "global", context: "contact" });
          }}
        />
      ) : null}
    </section>
  );
}
