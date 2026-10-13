"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import WhatsAppQuickModal from "@/components/WhatsAppQuickModal";
import HomeFinalCTA from "@/components/sections/HomeFinalCTA";
import HomeProcess from "@/components/sections/HomeProcess";
import HomeTrustStrip from "@/components/sections/HomeTrustStrip";
import { track, trackLinkClick } from "@/lib/analytics";
import { addLead } from "@/lib/leads";
import { getWhatsAppQuickFields } from "@/lib/whatsappQuickFields";
import site from "@/content/es/site.json";

const HERO_IMAGE = "/images/dbm-v2/DBM_WEB_V2_HERO_PORTON_NEGRO_AMBIENTACION.webp";

const FEATURED_SERVICES = [
  {
    category: "Escaleras",
    title: "Escalera y barandilla metálicas",
    description: "Escalera y barandilla realizadas a medida.",
    href: "/servicios/escaleras-metalicas",
    image: "/images/dbm-v2/DBM_REAL_escalera_barandilla_inox_gimnasio_03.jpg",
    alt: "Escalera metálica iluminada con barandilla",
    layout: "lg:col-span-5 lg:row-span-2",
    imageLayout: "sm:h-64 lg:h-auto lg:min-h-[540px] lg:flex-1",
    imageClass: "object-cover scale-[1.35] object-[70%_center] group-hover:scale-[1.39]",
    sizes: "(min-width: 1024px) 38vw, (min-width: 640px) 50vw, 42vw"
  },
  {
    category: "Cerramientos",
    title: "Reja metálica para ventana",
    description: "Reja metálica adaptada a una ventana.",
    href: "/servicios/puertas-rejas-cerramientos",
    image: "/images/dbm-v2/DBM_REAL_reja_ventana_madera_01.jpg",
    alt: "Reja metálica instalada en una ventana",
    layout: "lg:col-span-7",
    imageLayout: "sm:h-64 lg:h-60",
    imageClass: "object-cover object-center sm:object-cover group-hover:scale-[1.03] lg:object-[center_45%]",
    sizes: "(min-width: 1024px) 58vw, (min-width: 640px) 50vw, 42vw"
  },
  {
    category: "Puertas y portones",
    title: "Portón metálico decorativo",
    description: "Portón metálico con diseño decorativo.",
    href: "/servicios/puertas-rejas-cerramientos",
    image: "/images/dbm-v2/DBM_REAL_TRABAJOS_porton_decorativo_44285.webp",
    alt: "Portón metálico con motivos decorativos",
    layout: "lg:col-span-4",
    imageLayout: "sm:h-64 lg:h-52",
    imageClass: "object-cover group-hover:scale-[1.03]",
    sizes: "(min-width: 1024px) 34vw, (min-width: 640px) 50vw, 42vw"
  },
  {
    category: "Cubiertas",
    title: "Cubierta metálica roja",
    description: "Cubierta metálica acabada en color rojo.",
    href: "/servicios/techos-cubiertas",
    image: "/images/dbm-v2/DBM_REAL_TRABAJOS_cubierta_metalica_roja_73283.webp",
    alt: "Cubierta metálica de color rojo",
    layout: "lg:col-span-3",
    imageLayout: "sm:h-64 lg:h-52",
    imageClass: "object-cover group-hover:scale-[1.03]",
    sizes: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 42vw"
  }
] as const;

export default function HomePage() {
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const phone = site.business.phone;
  const quickFields = getWhatsAppQuickFields();

  function openWhatsApp() {
    setWhatsAppOpen(true);
    trackLinkClick({ href: "whatsapp_modal", label: "WhatsApp", context: "home_hero" });
    track("whatsapp_quick_open", { mode: "quick", service: "global", context: "home_hero" });
  }

  return (
    <>
      <section
        aria-labelledby="home-hero-title"
        className="relative isolate min-h-[620px] overflow-hidden bg-[#111315] text-white md:min-h-[680px]"
      >
        <Image
          src={HERO_IMAGE}
          alt="Ambientación de un portón metálico negro en una vivienda moderna"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center] md:object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/10 md:from-black/80 md:via-black/50 md:to-transparent"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        <Container>
          <div className="relative z-10 flex min-h-[620px] items-center pb-10 pt-24 md:min-h-[680px] md:pb-20 md:pt-44">
            <div className="max-w-2xl lg:-translate-x-4">
              <div aria-hidden="true" className="mb-5 h-1 w-16 bg-[#F97316]" />
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#F97316] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] md:text-sm">
                Carpintería metálica en Castellón
              </p>
              <h1
                id="home-hero-title"
                className="max-w-xl text-4xl font-extrabold uppercase leading-[0.96] tracking-[-0.035em] sm:text-5xl md:text-7xl"
              >
                Soluciones en metal <span className="block text-[#F97316]">a medida</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:text-lg md:text-xl">
                Diseñamos, fabricamos e instalamos soluciones metálicas para particulares y empresas en Castellón y provincia.
              </p>

              <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  href="/presupuesto"
                  className="w-full !border-[#F97316] !bg-[#F97316] px-6 py-3.5 font-semibold !text-[#111315] hover:!bg-[#EA580C] sm:w-auto"
                >
                  Pedir presupuesto
                </Button>
                <Button
                  href="/trabajos"
                  variant="secondary"
                  className="w-full !border-white/80 !bg-[#111315]/90 px-6 py-3.5 font-semibold !text-white backdrop-blur-sm hover:!border-white hover:!bg-black sm:w-auto"
                >
                  Ver trabajos
                </Button>
                <Button
                  variant="secondary"
                  onClick={openWhatsApp}
                  className="w-full !border-[#25D366] !bg-[#075E54] px-6 py-3.5 font-semibold !text-white hover:!bg-[#064E46] focus-visible:!ring-[#25D366] sm:w-auto"
                >
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="featured-services-title"
        className="overflow-hidden bg-[#0D0F10] text-white"
      >
        <Container>
          <div className="py-14 sm:py-16 lg:py-24">
            <div className="mb-8 flex flex-col gap-6 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">
                  <span aria-hidden="true" className="h-0.5 w-8 bg-[#F97316]" />
                  NUESTROS TRABAJOS
                </p>
                <h2
                  id="featured-services-title"
                  className="mt-4 max-w-xl text-3xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-4xl lg:text-5xl"
                >
                  SOLUCIONES METÁLICAS A MEDIDA
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                  Una selección de trabajos reales de carpintería metálica.
                </p>
              </div>

              <Link
                href="/servicios"
                className="group hidden shrink-0 items-center gap-2 text-sm font-bold text-[#F97316] underline decoration-[#F97316]/50 underline-offset-8 transition-colors hover:text-[#EA580C] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0D0F10] lg:inline-flex"
              >
                Ver todos los servicios
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-2">
              {FEATURED_SERVICES.map((service) => (
                <Link
                  key={service.image}
                  href={service.href}
                  className={`group flex min-h-36 min-w-0 overflow-hidden rounded-xl border border-white/15 bg-[#151719] text-white transition-colors hover:border-[#F97316] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0D0F10] sm:flex-col sm:rounded-sm ${service.layout}`}
                >
                  <div className={`relative min-h-36 w-[42%] shrink-0 overflow-hidden sm:min-h-0 sm:w-full ${service.image === "/images/dbm-v2/DBM_REAL_reja_ventana_madera_01.jpg" ? "" : "bg-[#25282A]"} ${service.imageLayout}`}>
                    <Image
                      src={service.image}
                      alt={service.alt}
                      fill
                      sizes={service.sizes}
                      className={`transition-transform duration-500 ease-out ${service.imageClass}`}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-2.5 p-3 sm:flex-none sm:gap-3 sm:p-5">
                    <div className="min-w-0 flex-1">
                      <p className="mb-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-[#F97316] sm:text-xs">
                        {service.category}
                      </p>
                      <h3 className="text-sm font-extrabold uppercase leading-tight tracking-[-0.01em] sm:text-base">
                        {service.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-snug text-white/65 sm:text-sm">
                        {service.description}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="ml-auto hidden h-8 w-8 shrink-0 place-items-center rounded-full border border-current text-base transition-colors group-hover:border-[#F97316] group-hover:bg-[#F97316] group-hover:text-[#111315] min-[360px]:grid sm:h-9 sm:w-9"
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-right lg:hidden">
              <Link
                href="/servicios"
                className="group inline-flex items-center gap-2 text-sm font-bold text-[#F97316] underline decoration-[#F97316]/50 underline-offset-8 hover:text-[#EA580C] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0D0F10]"
              >
                Ver todos los servicios
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <HomeProcess />

      <HomeTrustStrip />

      <HomeFinalCTA onWhatsApp={openWhatsApp} />

      <WhatsAppQuickModal
        open={whatsAppOpen}
        onClose={() => setWhatsAppOpen(false)}
        phoneE164={phone}
        mode="quick"
        title="WhatsApp"
        introLine="Hola, quiero pedir un presupuesto."
        fields={quickFields}
        submitLabel="Abrir WhatsApp con el mensaje"
        draftKey="home_hero_quick:global"
        onSubmitTrack={() => {
          addLead({ source: "header", meta: { channel: "whatsapp", context: "home_hero" } });
          track("whatsapp_quick_send", { mode: "quick", service: "global", context: "home_hero" });
        }}
      />
    </>
  );
}
