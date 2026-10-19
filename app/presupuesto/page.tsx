import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import HomeTrustStrip from "@/components/sections/HomeTrustStrip";
import { buildMetadata } from "@/lib/seo";
import site from "@/content/es/site.json";
import QuoteWizard from "@/components/QuoteWizard";
import { Suspense } from "react";

// P203 local visual draft: keep metadata, QuoteWizard and WhatsApp flows intact.
// The photograph is an existing approved *ambient* illustration, not a claimed DBM job.
const WORKSHOP_AMBIENCE = "/images/dbm-v2/DBM_WEB_V2_CTA_TALLER_AMBIENTACION_APROBADA.webp";

export const metadata = buildMetadata({
  title: "Presupuesto por WhatsApp | DBM Carpinteria Metalica",
  description:
    "Pide presupuesto por WhatsApp. Envia fotos, medidas y ubicacion. Respondemos en horario laboral.",
  slug: "/presupuesto"
});

function toWhatsAppUrl(phoneE164: string, text: string) {
  const normalized = phoneE164.replace(/\s+/g, "");
  const phone = normalized.startsWith("+") ? normalized.substring(1) : normalized;
  const params = new URLSearchParams({ text });
  return `https://wa.me/${phone}?${params.toString()}`;
}

const REQUIREMENTS = [
  { number: "01", label: "LOCALIDAD", description: "Dinos dónde se encuentra el trabajo." },
  { number: "02", label: "FOTOS", description: "Comparte imágenes del espacio o del elemento." },
  { number: "03", label: "MEDIDAS", description: "Bastan medidas aproximadas o un plano." },
  { number: "04", label: "QUÉ NECESITAS", description: "Describe brevemente qué quieres fabricar o reparar." }
] as const;

const STEPS = [
  { number: "01", title: "NOS CUENTAS EL TRABAJO", detail: "A través del formulario, WhatsApp o una llamada." },
  { number: "02", title: "LO REVISAMOS", detail: "Estudiamos la información y consultamos lo necesario." },
  { number: "03", title: "PREPARAMOS EL PRESUPUESTO", detail: "Te orientamos según los requisitos del proyecto." }
] as const;

export default function PresupuestoPage() {
  const phoneE164 = site.business.phone;
  const presupuestoMsg = [
    "Hola, quiero pedir presupuesto.",
    "Localidad: (indicar)",
    "Trabajo: (indicar)",
    "Medidas aproximadas: (indicar)",
    "Material / acabado: (indicar)",
    "",
    "Adjunto fotos a continuacion.",
    "Gracias."
  ].join("\n");
  const visitaMsg = [
    "Hola, quiero reservar una visita para tomar medidas.",
    "Localidad: (indicar)",
    "Tipo de trabajo: (indicar)",
    "Disponibilidad aproximada: (indicar)",
    "",
    "Gracias."
  ].join("\n");

  const waPresupuesto = toWhatsAppUrl(phoneE164, presupuestoMsg);
  const waVisita = toWhatsAppUrl(phoneE164, visitaMsg);
  const callHref = `tel:${phoneE164.replace(/\s+/g, "")}`;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#0A0C0D] text-white" aria-labelledby="presupuesto-title">
        <Image src={WORKSHOP_AMBIENCE} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#0A0C0D]/95 via-[#0A0C0D]/80 to-black/35" />
        <Container>
          <div className="relative z-10 flex min-h-[420px] max-w-3xl flex-col justify-center py-16 sm:min-h-[460px] sm:py-20">
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">
              <span aria-hidden="true" className="h-0.5 w-9 bg-[#F97316]" />
              Presupuesto a medida
            </p>
            <h1 id="presupuesto-title" className="mt-5 text-4xl font-extrabold uppercase leading-[0.97] tracking-tight sm:text-5xl lg:text-6xl">
              Cuéntanos <span className="block text-[#F97316]">tu proyecto</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Envíanos algunas fotos, medidas aproximadas y la localidad. Revisamos contigo lo que necesitas para preparar el presupuesto.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="#solicitud" className="!border-[#F97316] !bg-[#F97316] !text-[#101214] hover:!bg-[#EA580C]">Solicitar presupuesto</Button>
              <Button variant="secondary" href={waPresupuesto} className="!border-white/60 !bg-[#101214]/70 !text-white hover:!bg-[#101214]">WhatsApp directo</Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12 text-slate-900 sm:py-16" aria-labelledby="requisitos-title">
        <Container>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#EA580C]">Información necesaria</p>
          <h2 id="requisitos-title" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Con esto podemos <span className="text-[#EA580C]">empezar</span>
          </h2>
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {REQUIREMENTS.map((item) => (
              <div key={item.number} className="border-l-2 border-[#F97316] pl-4 sm:border-l-0 sm:border-t-2 sm:pl-0 sm:pt-5">
                <p className="text-2xl font-black text-[#EA580C]">{item.number}</p>
                <h3 className="mt-2 font-bold tracking-wide">{item.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="solicitud" className="bg-[#F3F4F5] py-14 text-slate-900 sm:py-20" aria-labelledby="solicitud-title">
        <Container>
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#EA580C]">Tu presupuesto</p>
            <h2 id="solicitud-title" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Describe tu trabajo</h2>
            <p className="mt-3 text-slate-600">Rellena los datos del formulario y abre WhatsApp con el mensaje preparado. Tú decides cuándo enviarlo.</p>
          </div>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
            <Suspense fallback={<div className="rounded-xl border p-6 text-slate-600">Cargando formulario…</div>}>
              <QuoteWizard phoneE164={phoneE164} />
            </Suspense>
          </div>
        </Container>
      </section>

      <section id="whatsapp" className="bg-[#121619] py-14 text-white sm:py-20" aria-labelledby="whatsapp-title">
        <Container>
          <div className="grid items-center gap-9 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#F97316]">La forma más rápida</p>
              <h2 id="whatsapp-title" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Envíanos la información <span className="text-[#F97316]">por WhatsApp</span>
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">Cuéntanos tu proyecto y adjunta fotos o planos directamente en la conversación.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button href={waPresupuesto} className="!border-[#F97316] !bg-[#F97316] !text-[#111315] hover:!bg-[#EA580C]">Abrir WhatsApp</Button>
                <Button variant="secondary" href={callHref} className="!border-white/50 !bg-transparent !text-white hover:!bg-white/10">Llamar</Button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-7">
              <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#F97316]">Puedes enviarnos</p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/85">
                <li>• Fotografías del lugar o de la pieza</li>
                <li>• Medidas aproximadas o croquis</li>
                <li>• Localidad y explicación del trabajo</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14 text-slate-900 sm:py-20" aria-labelledby="visita-title">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-[#F3F4F5] p-7 sm:p-10">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#EA580C]">Medición en obra</p>
              <p className="mt-5 text-xl font-semibold leading-snug sm:text-2xl">Algunos proyectos necesitan una visita para revisar medidas, accesos y condiciones de montaje.</p>
              <p className="mt-4 text-sm text-slate-600">La visita se coordina directamente con DBM según el trabajo y la ubicación.</p>
            </div>
            <div>
              <h2 id="visita-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">¿Necesitamos verlo?</h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">Si el trabajo requiere tomar medidas o revisar algo en persona, podemos concertar una visita en Castellón y provincia.</p>
              <div className="mt-7"><Button href={waVisita} className="!border-[#F97316] !bg-[#F97316] !text-[#111315] hover:!bg-[#EA580C]">Solicitar visita</Button></div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#F3F4F5] py-14 text-slate-900 sm:py-16" aria-labelledby="proceso-title">
        <Container>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#EA580C]">Nuestro proceso</p>
          <h2 id="proceso-title" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Así de <span className="text-[#EA580C]">sencillo</span></h2>
          <ol className="mt-8 grid gap-5 lg:grid-cols-3">
            {STEPS.map((item) => (
              <li key={item.number} className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-2xl font-black text-[#EA580C]">{item.number}</p>
                <h3 className="mt-2 font-extrabold text-sm">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.detail}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <HomeTrustStrip />

      <section className="relative isolate overflow-hidden bg-[#0A0C0D] py-14 text-white sm:py-20" aria-labelledby="final-presupuesto-title">
        <Image src={WORKSHOP_AMBIENCE} alt="" fill sizes="100vw" className="object-cover object-center" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#0A0C0D]/95 via-[#0A0C0D]/80 to-black/35" />
        <Container>
          <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F97316]">Tu idea, en metal</p>
              <h2 id="final-presupuesto-title" className="mt-3 text-3xl font-extrabold uppercase leading-tight sm:text-4xl">¿Hablamos de <span className="text-[#F97316]">tu proyecto?</span></h2>
              <p className="mt-3 max-w-lg text-white/80">Cuéntanos qué necesitas y te orientamos para preparar tu presupuesto.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href={waPresupuesto} className="!border-[#F97316] !bg-[#F97316] !text-[#111315] hover:!bg-[#EA580C]">WhatsApp</Button>
              <Button variant="secondary" href={callHref} className="!border-white/60 !bg-black/40 !text-white hover:!bg-black/60">Llamar</Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
