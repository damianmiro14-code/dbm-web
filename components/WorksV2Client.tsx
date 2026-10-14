"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import HomeTrustStrip from "@/components/sections/HomeTrustStrip";
import HomeFinalCTA from "@/components/sections/HomeFinalCTA";
import WhatsAppQuickModal from "@/components/WhatsAppQuickModal";
import { getWhatsAppQuickFields } from "@/lib/whatsappQuickFields";
import { addLead } from "@/lib/leads";
import { track, trackLinkClick } from "@/lib/analytics";
import site from "@/content/es/site.json";

type WorkPhoto = {
  image: string;
  alt: string;
  title: string;
  category: string;
  serviceHref: string;
};

type Props = { faqs: { question: string; answer: string }[] };

// Fotos ya existentes en el repositorio de DBM.
// IMPORTANTE: son ejemplos visuales; no se atribuye un proyecto, cliente,
// localidad o proceso específico sin vinculación documental verificada.
const FEATURE: WorkPhoto = {
  image: "/images/dbm-v2/DBM_REAL_escalera_barandilla_inox_gimnasio_03.jpg",
  alt: "Escalera metálica con barandillas e iluminación en los peldaños",
  title: "Escaleras y barandillas",
  category: "Acero inoxidable y metal",
  serviceHref: "/servicios/escaleras-metalicas"
};

const FEATURED: WorkPhoto[] = [
  {
    image: "/images/dbm-v2/DBM_REAL_TRABAJOS_porton_decorativo_44285.webp",
    alt: "Portón metálico decorativo instalado en el acceso de una vivienda",
    title: "Puertas y cerramientos",
    category: "Carpintería metálica",
    serviceHref: "/servicios/puertas-rejas-cerramientos"
  },
  {
    image: "/images/dbm-v2/DBM_REAL_reja_ventana_madera_01.jpg",
    alt: "Reja metálica negra instalada sobre una fachada de madera",
    title: "Rejas a medida",
    category: "Protección de accesos",
    serviceHref: "/servicios/puertas-rejas-cerramientos"
  },
  {
    image: "/images/dbm-v2/DBM_REAL_TRABAJOS_cubierta_metalica_roja_73283.webp",
    alt: "Cubierta metálica terminada",
    title: "Cubiertas metálicas",
    category: "Cubiertas y paneles",
    serviceHref: "/servicios/techos-cubiertas"
  }
];

const GALLERY: WorkPhoto[] = [
  {
    image: "/images/work/categorized/trabajos/estructura-pergola-metalica-jardin.jpg",
    alt: "Estructura metálica construida para exterior",
    title: "Estructuras a medida",
    category: "Estructuras",
    serviceHref: "/servicios/estructuras-metalicas"
  },
  {
    image: "/images/work/categorized/trabajos/puerta-garaje-metalica-negra.jpg",
    alt: "Puerta metálica negra para un acceso",
    title: "Puertas metálicas",
    category: "Cerramientos",
    serviceHref: "/servicios/puertas-rejas-cerramientos"
  },
  {
    image: "/images/work/categorized/trabajos/barandilla-inox-cristal-vivienda.jpg",
    alt: "Barandilla de acero inoxidable y vidrio en una vivienda",
    title: "Barandillas de inox y vidrio",
    category: "Acabados y protección",
    serviceHref: "/servicios/inox"
  },
  {
    image: "/images/work/categorized/trabajos/puerta-corredera-malla-metalica.jpg",
    alt: "Puerta corredera con cerramiento metálico de malla",
    title: "Cerramientos correderos",
    category: "Accesos",
    serviceHref: "/servicios/puertas-rejas-cerramientos"
  },
  {
    image: "/images/work/categorized/trabajos/soldadura-estructura-metalica-taller.jpg",
    alt: "Estructura de perfiles metálicos en proceso de montaje",
    title: "Estructura metálica en obra",
    category: "Montaje metálico",
    serviceHref: "/servicios/estructuras-metalicas"
  },
  {
    image: "/images/work/categorized/trabajos/soldadura-barandilla-inox-escalera.jpg",
    alt: "Trabajo de soldadura en una barandilla metálica",
    title: "Soldadura metálica",
    category: "Soldadura",
    serviceHref: "/servicios/soldadura"
  }
];

function TrackedLink({ href, label, context, children, className }: {
  href: string;
  label: string;
  context: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={className} onClick={() => trackLinkClick({ href, label, context })}>
      {children}
    </Link>
  );
}

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111518]";

function PhotoCard({ item, prominent = false }: { item: WorkPhoto; prominent?: boolean }) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/15 bg-[#151A1D] transition-colors hover:border-[#F97316]/70">
      <div className={`relative min-w-0 overflow-hidden bg-[#252C30] ${prominent ? "aspect-[4/3] sm:aspect-[4/3] lg:min-h-[490px] lg:flex-1 lg:aspect-auto" : "aspect-[4/3] sm:aspect-[16/10]"}`}>
        <Image
          src={item.image}
          alt={item.alt}
          fill
          sizes={prominent ? "(min-width: 1024px) 52vw, 100vw" : "(min-width: 1024px) 38vw, (min-width: 640px) 50vw, 100vw"}
          loading="lazy"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />
        <span className="absolute bottom-3 left-4 rounded bg-black/65 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.13em] text-white">
          {item.category}
        </span>
      </div>
      <div className={`flex items-center justify-between gap-3 ${prominent ? "p-5 sm:p-6" : "p-4 sm:p-5"}`}>
        <h3 className={`${prominent ? "text-xl sm:text-2xl" : "text-base sm:text-lg"} font-extrabold leading-tight text-white`}>{item.title}</h3>
        <TrackedLink
          href={item.serviceHref}
          label={`Ver servicio: ${item.title}`}
          context="works_v2_photo"
          className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-[#FDBA74] underline underline-offset-4 hover:text-white ${focus}`}
        >
          Ver servicio <span aria-hidden="true">→</span>
        </TrackedLink>
      </div>
    </article>
  );
}

export default function WorksV2Client({ faqs }: Props) {
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);

  function openWhatsApp(context: string) {
    setWhatsAppOpen(true);
    trackLinkClick({ href: "whatsapp_modal", label: "WhatsApp", context });
    track("whatsapp_quick_open", { mode: "quick", service: "global", context });
  }

  return (
    <>
      <section aria-labelledby="works-v2-title" className="relative isolate overflow-hidden bg-[#0B0D0F] text-white">
        {/* La foto de soldadura es vertical: a la derecha en escritorio para que
            el operario no quede recortado; a pantalla completa en móvil. */}
        <div aria-hidden="true" className="absolute inset-y-0 right-0 w-full lg:w-[60%]">
          <Image
            src="/images/work/categorized/soldadura/dbm-soldadura-02.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover object-[59%_center] sm:object-[52%_center] lg:object-center"
          />
          {/* Suaviza solo en escritorio la union de la foto vertical con el fondo oscuro. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-[40%] bg-gradient-to-r from-[#090B0D] via-[#090B0D]/60 to-transparent lg:block" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#090B0D]/95 via-[#090B0D]/75 to-[#090B0D]/35 lg:via-[#090B0D]/70 lg:to-[#090B0D]/15" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#090B0D]/60 via-transparent to-black/30" />
        <Container>
          <div className="relative z-10 flex min-h-[490px] items-center py-16 sm:min-h-[510px] lg:min-h-[570px] lg:py-24">
            <div className="max-w-[740px]">
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#FB923C]">
                <span aria-hidden="true" className="h-0.5 w-9 bg-[#F97316]" />
                DBM · Castellón y provincia
              </p>
              <h1 id="works-v2-title" className="mt-5 max-w-3xl text-[2.65rem] font-extrabold uppercase leading-[0.98] tracking-[-0.035em] min-[375px]:text-[3rem] sm:text-5xl lg:text-[4.2rem]">
                Trabajos reales <span className="block text-[#F97316]">en metal</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
                Una selección de fotografías de carpintería metálica, estructuras, cubiertas, puertas y barandillas. Fabricación y montaje a medida.
              </p>
              <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="#trabajos-destacados"
                  onClick={() => trackLinkClick({ href: "#trabajos-destacados", label: "Ver trabajos", context: "works_v2_hero" })}
                  className={`inline-flex w-full items-center justify-center rounded-xl border border-[#F97316] bg-[#F97316] px-6 py-3.5 font-semibold text-[#111315] transition-colors hover:bg-[#FB923C] sm:w-auto ${focus}`}
                >
                  Ver trabajos <span aria-hidden="true" className="ml-2">↓</span>
                </a>
                <Button href="/presupuesto" className="w-full !border-white/60 !bg-[#101315]/75 px-6 py-3.5 font-semibold !text-white hover:!bg-[#263036] sm:w-auto">
                  Pedir presupuesto
                </Button>
              </div>
              <p className="mt-6 text-xs leading-relaxed text-white/75">Fotografías reales de trabajos de carpintería metálica y montaje.</p>
            </div>
          </div>
        </Container>
      </section>

      <HomeTrustStrip />

      <section id="trabajos-destacados" aria-labelledby="works-featured-title" className="scroll-mt-20 bg-[#111619] py-14 text-white sm:py-20">
        <Container>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#FB923C]">Selección DBM</p>
              <h2 id="works-featured-title" className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">Trabajos destacados</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">Distintos ejemplos de lo que podemos fabricar e instalar en hierro, acero y acero inoxidable.</p>
            </div>
            <a href="#galeria-real" onClick={() => trackLinkClick({ href: "#galeria-real", label: "Ver galería", context: "works_v2_featured" })} className={`self-start text-sm font-bold text-[#FDBA74] underline underline-offset-8 hover:text-white ${focus}`}>Ver galería completa →</a>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
            <PhotoCard item={FEATURE} prominent />
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <div className="sm:col-span-2"><PhotoCard item={FEATURED[0]} /></div>
              {FEATURED.slice(1).map(item => <PhotoCard key={item.image} item={item} />)}
            </div>
          </div>
        </Container>
      </section>

      <section id="galeria-real" aria-labelledby="works-gallery-title" className="scroll-mt-20 border-t border-white/10 bg-[#181D20] py-14 text-white sm:py-20">
        <Container>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#FB923C]">Selección fotográfica</p>
            <h2 id="works-gallery-title" className="mt-2 text-3xl font-extrabold sm:text-4xl">Más fotografías de trabajos</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">Fabricación, montaje y soluciones metálicas de diferentes tipos. Cada imagen enlaza con el servicio correspondiente.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY.map(item => <PhotoCard key={item.image} item={item} />)}
          </div>
          <div className="mt-10 flex flex-col items-start gap-4 rounded-xl border border-white/15 bg-[#0E1214] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div>
              <h3 className="text-lg font-extrabold sm:text-xl">¿Quieres algo parecido para tu proyecto?</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">Cuéntanos qué necesitas y adjunta tus fotos o medidas en la solicitud de presupuesto.</p>
            </div>
            <Button href="/presupuesto" className="w-full shrink-0 !border-[#F97316] !bg-[#F97316] !text-[#111315] hover:!bg-[#FB923C] sm:w-auto">Pedir presupuesto</Button>
          </div>
        </Container>
      </section>

      <section aria-labelledby="works-faq-title" className="border-t border-white/10 bg-[#121719] py-14 text-white sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#FB923C]">Preguntas frecuentes</p>
              <h2 id="works-faq-title" className="mt-2 text-3xl font-extrabold sm:text-4xl">Tu próximo trabajo</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/75">Si tienes una idea o una reparación pendiente, podemos valorar opciones a partir de fotos, medidas y ubicación.</p>
            </div>
            <div className="space-y-3">
              {faqs.map(item => (
                <details key={item.question} className="group overflow-hidden rounded-xl border border-white/15 bg-[#1D2326] open:border-[#F97316]/60">
                  <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-semibold marker:hidden sm:p-5 ${focus}`}>
                    <span>{item.question}</span>
                    <span aria-hidden="true" className="text-xl font-bold text-[#FDBA74] group-open:rotate-45">+</span>
                  </summary>
                  <p className="px-4 pb-5 text-sm leading-relaxed text-white/80 sm:px-5">{item.answer}</p>
                </details>
              ))}
              <TrackedLink href="/servicios" label="Todos los servicios" context="works_v2_faq" className={`mt-2 inline-flex text-sm font-bold text-[#FDBA74] underline underline-offset-8 hover:text-white ${focus}`}>
                Ver todos nuestros servicios →
              </TrackedLink>
            </div>
          </div>
        </Container>
      </section>

      <HomeFinalCTA onWhatsApp={() => openWhatsApp("works_v2_final_cta")} />

      <WhatsAppQuickModal
        open={whatsAppOpen}
        onClose={() => setWhatsAppOpen(false)}
        phoneE164={site.business.phone}
        mode="quick"
        title="WhatsApp"
        introLine="Hola, quiero pedir un presupuesto."
        fields={getWhatsAppQuickFields()}
        submitLabel="Abrir WhatsApp con el mensaje"
        draftKey="works_v2_quick:global"
        onSubmitTrack={() => {
          addLead({ source: "header", meta: { channel: "whatsapp", context: "works_v2" } });
          track("whatsapp_quick_send", { mode: "quick", service: "global", context: "works_v2" });
        }}
      />
    </>
  );
}
