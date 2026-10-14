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

type ServiceItem = { title: string; description: string; href?: string };
type FAQItem = { question: string; answer: string };
type Props = { services: ServiceItem[]; faqs: FAQItem[] };

type ServiceVisual = {
  href: string;
  title: string;
  teaser: string;
  image: string;
  alt: string;
  layout?: string;
};

// Fotografías alojadas en el repositorio de DBM. Cada tarjeta describe el servicio,
// no presenta la fotografía como un caso documentado ni atribuye una localidad.
const FEATURED: ServiceVisual[] = [
  {
    href: "/servicios/puertas-rejas-cerramientos",
    title: "Puertas, rejas y cerramientos",
    teaser: "Diseño, seguridad y soluciones a medida.",
    image: "/images/dbm-v2/DBM_REAL_TRABAJOS_porton_decorativo_44285.webp",
    alt: "Portón metálico decorativo de chapa",
    layout: "lg:col-span-5 lg:row-span-2"
  },
  {
    href: "/servicios/estructuras-metalicas",
    title: "Estructuras metálicas",
    teaser: "Fabricación y montaje para cada proyecto.",
    image: "/images/work/categorized/montajes-industriales/dbm-montajes-industriales-estructura-metalica-industrial-01.jpg",
    alt: "Estructura metálica de perfiles de acero",
    layout: "lg:col-span-7"
  },
  {
    href: "/servicios/panel-sandwich",
    title: "Cubiertas y panel sándwich",
    teaser: "Soluciones de cubierta y cerramiento.",
    image: "/images/work/categorized/techos-cubiertas/dbm-techos-cubiertas-nave-industrial-panel-sandwich-01.jpg",
    alt: "Cubierta y estructura de una nave",
    layout: "lg:col-span-4"
  },
  {
    href: "/servicios/escaleras-metalicas",
    title: "Escaleras y barandillas",
    teaser: "Funcionalidad y acabado a medida.",
    image: "/images/dbm-v2/DBM_REAL_escalera_barandilla_inox_gimnasio_03.jpg",
    alt: "Escalera metálica y barandilla con iluminación",
    layout: "lg:col-span-3"
  }
];

const OTHER_VISUALS: ServiceVisual[] = [
  {
    href: "/servicios/soldadura",
    title: "Soldadura profesional",
    teaser: "MIG/MAG, TIG y electrodo.",
    image: "/images/work/categorized/soldadura/dbm-soldadura-02.jpg",
    alt: "Trabajo de soldadura y fabricación metálica"
  },
  {
    href: "/servicios/carpinteria-metalica-a-medida",
    title: "Carpintería metálica a medida",
    teaser: "Piezas y soluciones personalizadas.",
    image: "/images/work/categorized/trabajos-varios/campana-barbacoa.jpg",
    alt: "Campana metálica fabricada a medida"
  },
  {
    href: "/servicios/montajes-industriales",
    title: "Montajes industriales",
    teaser: "Estructuras y componentes en obra.",
    image: "/images/work/categorized/montajes-industriales/dbm-montajes-industriales-montaje-estructura-grua-02.jpg",
    alt: "Montaje de estructura de acero con maquinaria de elevación"
  },
  {
    href: "/servicios/inox",
    title: "Trabajos en acero inoxidable",
    teaser: "Elementos inox y acabados funcionales.",
    image: "/images/work/categorized/inox/dbm-inox-barandilla-acero-inoxidable-cristal-01.jpg",
    alt: "Barandilla de acero inoxidable y vidrio"
  },
  {
    href: "/servicios/techos-cubiertas",
    title: "Techos y cubiertas metálicas",
    teaser: "Protección y soluciones para cubiertas.",
    image: "/images/work/categorized/techos-cubiertas/dbm-techos-cubiertas-techo-panel-sandwich-02.jpg",
    alt: "Techo metálico de panel sándwich"
  },
  {
    href: "/servicios/cerramientos-paramentos-industriales",
    title: "Cerramientos industriales",
    teaser: "Fachadas, divisiones y paramentos.",
    image: "/images/work/categorized/cerramientos-paramentos-industriales/dbm-cerramientos-paramentos-industriales-01.jpg",
    alt: "Cerramiento metálico de uso industrial"
  },
  {
    href: "/servicios/cerraduras-refuerzos",
    title: "Cerraduras y refuerzos",
    teaser: "Cierres, reparaciones y seguridad.",
    image: "/images/work/categorized/cerraduras-refuerzos/dbm-cerraduras-bombin-europerfil-02.jpg",
    alt: "Detalle de bombín y cerradura de puerta"
  }
];

// Collage secundario: misma gramática visual que las tarjetas protagonistas,
// pero en tres filas calmadas (7+5, 4+4+4, 5+7 columnas a partir de 1024px).
// En tablet se usan dos columnas; en móvil conservamos tarjetas horizontales.
const OTHER_MOSAIC_SPANS = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-5",
  "sm:col-span-2 lg:col-span-7"
] as const;

const RELATED = [
  {
    image: "/images/dbm-v2/DBM_REAL_reja_ventana_madera_01.jpg",
    alt: "Reja metálica instalada en una ventana",
    caption: "Rejas y cerramientos"
  },
  {
    image: "/images/dbm-v2/DBM_REAL_TRABAJOS_cubierta_metalica_roja_73283.webp",
    alt: "Cubierta metálica terminada en color rojo",
    caption: "Cubiertas metálicas"
  },
  {
    image: "/images/work/categorized/trabajos/barandilla-cristal-escalera-interior.jpg",
    alt: "Barandilla de vidrio en una escalera interior",
    caption: "Escaleras y barandillas"
  }
] as const;

const PROCESS = [
  { number: "01", title: "Medimos", text: "Nos cuentas tu idea. Revisamos fotos, medidas y ubicación y coordinamos una visita si hace falta." },
  { number: "02", title: "Fabricamos", text: "Preparamos la solución metálica adaptada al trabajo y sus requisitos." },
  { number: "03", title: "Montamos", text: "Realizamos el montaje y los ajustes necesarios según el proyecto." }
] as const;

function TrackLink({ href, label, context, children, className }: {
  href: string;
  label: string;
  context: string;
  children: ReactNode;
  className: string;
}) {
  return (
    <Link href={href} className={className} onClick={() => trackLinkClick({ href, label, context })}>
      {children}
    </Link>
  );
}

export default function ServicesV2Client({ services, faqs }: Props) {
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const indexed = new Map(services.map((service) => [service.href, service]));
  const otherServices = OTHER_VISUALS.filter(item => indexed.has(item.href));
  const featuredServices = FEATURED.filter(item => indexed.has(item.href));

  function openWhatsApp(context: string) {
    setWhatsAppOpen(true);
    trackLinkClick({ href: "whatsapp_modal", label: "WhatsApp", context });
    track("whatsapp_quick_open", { mode: "quick", service: "global", context });
  }

  const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0F10]";

  return (
    <>
      <section aria-labelledby="services-v2-title" className="relative isolate overflow-hidden bg-[#0B0D0F] text-white">
        <Image
          src="/images/dbm-v2/DBM_WEB_V2_PROCESO_SOLDADOR_AMBIENTACION.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[80%_center] sm:object-[55%_center] lg:object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#090B0D]/95 via-[#090B0D]/70 to-[#090B0D]/20 sm:via-[#090B0D]/75 sm:to-[#090B0D]/30 lg:from-[#090B0D]/95 lg:via-[#090B0D]/60 lg:to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#090B0D]/70 via-transparent to-black/20" />
        <Container>
          <div className="relative z-10 flex min-h-[480px] items-center py-16 sm:min-h-[510px] sm:py-20 lg:min-h-[540px] lg:py-24">
            <div className="max-w-[780px]">
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.20em] text-[#FB923C]">
                <span aria-hidden="true" className="h-0.5 w-10 bg-[#F97316]" />
                DBM · Castellón y provincia
              </p>
              <h1 id="services-v2-title" className="mt-5 max-w-3xl text-[2.5rem] font-extrabold uppercase leading-[0.98] tracking-[-0.035em] min-[375px]:text-[2.8rem] sm:text-5xl lg:text-[3.65rem] xl:text-[4rem]">
                Servicios de <span className="block text-[#F97316]">carpintería metálica</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
                Fabricamos, reparamos y montamos soluciones metálicas a medida para particulares, empresas e industria en Castellón y provincia.
              </p>
              <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button href="/presupuesto" className="w-full !border-[#F97316] !bg-[#F97316] px-6 py-3.5 font-semibold !text-[#101214] hover:!bg-[#FB923C] sm:w-auto">Pedir presupuesto</Button>
                <Button onClick={() => openWhatsApp("services_v2_hero")} variant="secondary" className="w-full !border-[#25D366] !bg-[#075E54] px-6 py-3.5 font-semibold !text-white hover:!bg-[#064E46] sm:w-auto">WhatsApp</Button>
              </div>
              <p className="mt-5 text-sm text-white/75">¿No sabes qué servicio necesitas? Cuéntanos tu proyecto y te orientamos.</p>
            </div>
          </div>
        </Container>
      </section>

      <section id="servicios-dbm" aria-labelledby="services-featured-title" className="bg-[#111518] py-14 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.20em] text-[#FB923C]"><span aria-hidden="true" className="h-0.5 w-9 bg-[#F97316]"/>Nuestros servicios</p>
              <h2 id="services-featured-title" className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-4xl xl:text-5xl">
                Soluciones en metal para <span className="text-[#FB923C]">cada proyecto</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">Desde una reja o un refuerzo hasta una estructura industrial. Descubre las especialidades de nuestro taller.</p>
            </div>
            <a href="#catalogo-completo" className={`inline-flex shrink-0 items-center gap-2 self-start text-sm font-bold text-[#FB923C] underline decoration-[#FB923C]/50 underline-offset-8 hover:text-white lg:self-auto ${focus}`}>
              Explorar los 11 servicios <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-[250px_250px]">
            {featuredServices.map((item, index) => (
              <TrackLink key={item.href} href={item.href} label={item.title} context="services_v2_featured" className={`group flex min-h-[152px] overflow-hidden rounded-xl border border-white/15 bg-[#0D1012] text-white transition-colors hover:border-[#F97316] sm:relative sm:min-h-[245px] sm:flex-col sm:rounded-lg ${item.layout ?? ""} ${focus}`}>
                <div className="relative min-h-[152px] w-[42%] shrink-0 overflow-hidden bg-[#21272A] sm:min-h-0 sm:w-full sm:flex-1">
                  <Image src={item.image} alt={item.alt} fill sizes="(min-width: 1024px) 50vw, (min-width: 640px) 47vw, 42vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none" />
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-3 bg-[#0A0D0F] p-3.5 sm:min-h-[106px] sm:flex-none sm:p-4 lg:p-4">
                  <span className="shrink-0 text-2xl font-black text-[#F97316] sm:text-3xl">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-extrabold uppercase leading-snug sm:text-base">{item.title}</h3>
                    <p className="mt-1 text-xs leading-snug text-white/80 sm:text-sm">{item.teaser}</p>
                  </div>
                  <span aria-hidden="true" className="hidden h-9 w-9 shrink-0 place-items-center rounded-full border border-white/60 text-lg transition-colors group-hover:border-[#F97316] group-hover:bg-[#F97316] group-hover:text-black min-[360px]:grid">→</span>
                </div>
              </TrackLink>
            ))}
          </div>

          <div id="catalogo-completo" className="scroll-mt-28 pt-16 sm:pt-20 lg:pt-24">
            <div className="mb-8 flex flex-col gap-3 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#FB923C]">
                  <span aria-hidden="true" className="h-0.5 w-8 bg-[#F97316]" />
                  Más soluciones
                </p>
                <h3 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">También trabajamos en</h3>
              </div>
              <p className="text-sm text-white/65">11 servicios · Un mismo equipo</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12 lg:auto-rows-[286px]">
              {otherServices.map((item, index) => (
                <TrackLink
                  key={item.href}
                  href={item.href}
                  label={item.title}
                  context="services_v2_catalog"
                  className={`group flex min-h-[166px] min-w-0 overflow-hidden rounded-xl border border-white/15 bg-[#0A0D0F] text-white transition-colors hover:border-[#F97316] sm:h-[296px] sm:flex-col sm:rounded-lg lg:h-full lg:min-h-0 ${OTHER_MOSAIC_SPANS[index]} ${focus}`}
                >
                  <div className="relative min-h-[166px] w-[42%] shrink-0 overflow-hidden bg-[#20262A] sm:min-h-0 sm:w-full sm:flex-1">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      loading="lazy"
                      sizes="(min-width: 1024px) 55vw, (min-width: 640px) 47vw, 42vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-2.5 bg-[#0A0D0F] p-3 sm:min-h-[110px] sm:w-full sm:flex-none sm:gap-3 sm:p-4">
                    <span className="shrink-0 text-2xl font-black tabular-nums text-[#F97316] sm:text-3xl">
                      {String(index + 5).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-extrabold uppercase leading-snug sm:text-[0.95rem]">{item.title}</h4>
                      <p className="mt-1 text-xs leading-snug text-white/80">{item.teaser}</p>
                    </div>
                    <span aria-hidden="true" className="hidden h-9 w-9 shrink-0 place-items-center rounded-full border border-white/60 text-lg transition-colors group-hover:border-[#F97316] group-hover:bg-[#F97316] group-hover:text-black min-[360px]:grid">
                      →
                    </span>
                  </div>
                </TrackLink>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <HomeTrustStrip />

      <section aria-labelledby="services-process-title" className="border-b border-white/10 bg-[#181D20] py-14 text-white sm:py-20">
        <Container>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FB923C]">Así trabajamos</p>
            <h2 id="services-process-title" className="mt-2 text-3xl font-extrabold sm:text-4xl">De tu idea al montaje</h2>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {PROCESS.map(step => (
              <li key={step.number} className="rounded-xl border border-white/10 bg-[#111518] p-5 sm:p-6">
                <span className="text-3xl font-black text-[#F97316]">{step.number}</span>
                <h3 className="mt-3 text-lg font-extrabold uppercase">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="services-related-title" className="bg-[#121719] py-14 text-white sm:py-20">
        <Container>
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FB923C]">Fotografías de trabajos</p>
              <h2 id="services-related-title" className="mt-2 text-3xl font-extrabold sm:text-4xl">El metal, en proyectos reales</h2>
            </div>
            <TrackLink href="/trabajos" label="Ver más trabajos" context="services_v2_related" className={`self-start text-sm font-bold text-[#FB923C] underline underline-offset-8 hover:text-white ${focus}`}>
              Ver más trabajos →
            </TrackLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {RELATED.map(item => (
              <TrackLink key={item.image} href="/trabajos" label={item.caption} context="services_v2_related" className={`group overflow-hidden rounded-xl border border-white/15 bg-[#1D2326] text-white transition-colors hover:border-[#F97316] ${focus}`}>
                <div className="relative aspect-[4/3] overflow-hidden bg-[#293034]">
                  <Image src={item.image} alt={item.alt} fill sizes="(min-width: 640px) 32vw, 100vw" loading="lazy" className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transform-none" />
                </div>
                <div className="flex items-center justify-between gap-2 p-4"><span className="font-semibold">{item.caption}</span><span aria-hidden="true" className="text-[#FB923C]">→</span></div>
              </TrackLink>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/65">Fotografías de trabajos metálicos. Consulta los detalles y ejemplos en nuestra sección de trabajos.</p>
        </Container>
      </section>

      <section aria-labelledby="services-faq-title" className="border-t border-white/10 bg-[#1B2023] py-14 text-white sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FB923C]">Resolvemos tus dudas</p>
              <h2 id="services-faq-title" className="mt-2 text-3xl font-extrabold sm:text-4xl">Antes de pedir presupuesto</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/75">Con unas fotos, medidas y la localidad podemos empezar a valorar tu proyecto.</p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details key={faq.question} className="group overflow-hidden rounded-xl border border-white/15 bg-[#101416] open:border-[#F97316]/60">
                  <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-semibold marker:hidden sm:p-5 ${focus}`}>
                    <span>{faq.question}</span>
                    <span aria-hidden="true" className="text-xl font-bold text-[#FB923C] group-open:rotate-45">+</span>
                  </summary>
                  <p className="px-4 pb-5 text-sm leading-relaxed text-white/80 sm:px-5">{faq.answer}</p>
                </details>
              ))}
              <TrackLink href="/preguntas-frecuentes" label="Ver todas las preguntas" context="services_v2_faq" className={`mt-3 inline-flex text-sm font-bold text-[#FB923C] underline underline-offset-8 hover:text-white ${focus}`}>Ver todas las preguntas →</TrackLink>
            </div>
          </div>
        </Container>
      </section>

      <HomeFinalCTA onWhatsApp={() => openWhatsApp("services_v2_final_cta")} />

      <WhatsAppQuickModal
        open={whatsAppOpen}
        onClose={() => setWhatsAppOpen(false)}
        phoneE164={site.business.phone}
        mode="quick"
        title="WhatsApp"
        introLine="Hola, quiero pedir un presupuesto."
        fields={getWhatsAppQuickFields()}
        submitLabel="Abrir WhatsApp con el mensaje"
        draftKey="services_v2_quick:global"
        onSubmitTrack={() => {
          addLead({ source: "header", meta: { channel: "whatsapp", context: "services_v2" } });
          track("whatsapp_quick_send", { mode: "quick", service: "global", context: "services_v2" });
        }}
      />
    </>
  );
}
